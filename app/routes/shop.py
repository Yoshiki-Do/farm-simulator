from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Farm, Inventory
from ..items import CROPS, ITEMS

router = APIRouter()


@router.get("/shop")
def shop():
    return FileResponse("static/html/shop.html")


@router.get("/shop/seeds")
def get_seed_shop():
    return {
        "seeds": [
            {"item": crop, "name": data["name"], "price": data["seed_price"]}
            for crop, data in CROPS.items()
        ]
    }


@router.get("/shop/fertilizer")
def get_fertilizer_shop():
    return {
        "fertilizer": {
            "item": "fertilizer",
            "name": ITEMS["fertilizer"]["name"],
            "price": ITEMS["fertilizer"]["price"],
        }
    }


@router.post("/shop/buy-seed/{crop}")
def buy_seed(crop: str, farm_id: int, db: Session = Depends(get_db)):
    return buy_seeds(crop, farm_id, 1, db)


@router.post("/shop/buy-seed/{crop}/10")
def buy_10_seeds(crop: str, farm_id: int, db: Session = Depends(get_db)):
    return buy_seeds(crop, farm_id, 10, db)


def buy_seeds(crop: str, farm_id: int, amount: int, db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()

    if farm is None:
        return {"error": "Farm not found"}

    if crop not in CROPS:
        return {"error": "Unknown crop"}

    seed_price = CROPS[crop]["seed_price"]
    total_price = seed_price * amount

    if farm.money < total_price:
        return {"error": "Not enough money"}

    inventory = (
        db.query(Inventory)
        .filter(
            Inventory.farm_id == farm.id,
            Inventory.item == crop,
            Inventory.type == "seed",
        )
        .first()
    )

    if inventory is None:
        inventory = Inventory(farm_id=farm.id, item=crop, type="seed", quantity=0)
        db.add(inventory)

    farm.money -= total_price
    inventory.quantity += amount

    db.commit()
    db.refresh(farm)
    db.refresh(inventory)

    return {
        "message": f"Bought {amount} {crop} seeds",
        "money": farm.money,
        "item": inventory.item,
        "quantity": inventory.quantity,
    }


@router.post("/shop/buy-fertilizer")
def buy_fertilizer(farm_id: int, db: Session = Depends(get_db)):
    return buy_fertilizers(farm_id, 1, db)


@router.post("/shop/buy-fertilizer/10")
def buy_10_fertilizers(farm_id: int, db: Session = Depends(get_db)):
    return buy_fertilizers(farm_id, 10, db)


def buy_fertilizers(farm_id: int, amount: int, db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()

    if farm is None:
        return {"message": "Farm not found"}

    fertilizer_price = ITEMS["fertilizer"]["price"]
    total_price = fertilizer_price * amount

    if farm.money < total_price:
        return {"error": "Not enough money"}

    inventory = (
        db.query(Inventory)
        .filter(
            Inventory.farm_id == farm.id,
            Inventory.item == "fertilizer",
            Inventory.type == "item",
        )
        .first()
    )

    if inventory is None:
        inventory = Inventory(
            farm_id=farm.id, item="fertilizer", type="item", quantity=0
        )
        db.add(inventory)

    farm.money -= total_price
    inventory.quantity += amount

    db.commit()

    db.refresh(farm)
    db.refresh(inventory)

    return {
        "message": f"Bought {amount} fertilizer",
        "money": farm.money,
        "item": inventory.item,
        "quantity": inventory.quantity,
    }
