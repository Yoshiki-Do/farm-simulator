from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Farm, Plot, Inventory
from ..items import CROPS, ITEMS
from ..game_logic import calculate_harvest_amount, get_season

router = APIRouter()


@router.get("/plots/{plot_id}")
def get_plot(plot_id: int, farm_id: int, db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()

    if farm is None:
        return {"error": "Farm not found"}

    plot = db.query(Plot).filter(Plot.farm_id == farm.id, Plot.id == plot_id).first()

    if plot is None:
        return {"error": "Plot not found"}

    if plot.crop is None:
        return {"plot_id": plot.id, "status": "empty"}

    if plot.growth == 0:
        status = "seed"
    elif plot.growth < 1.0:
        status = "growing"
    else:
        status = "ready"

    return {
        "plot_id": plot.id,
        "crop": plot.crop,
        "name": CROPS[plot.crop]["name"],
        "growth": plot.growth,
        "status": status,
    }


@router.post("/plots/{plot_id}/plant/{crop}")
def plant_crop(plot_id: int, crop: str, farm_id: int, db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()

    if farm is None:
        return {"error": "Farm not found"}

    if crop not in CROPS:
        return {"error": "Unknown crop"}
    
    current_season = get_season(farm.day)
    
    if current_season not in CROPS[crop]["seasons"]:
        return {"error": f"{CROPS[crop]["name"]} cannot be planted in {current_season}"}

    plot = db.query(Plot).filter(Plot.farm_id == farm.id, Plot.id == plot_id).first()

    if plot is None:
        return {"error": "Plot not found"}

    if plot.crop is not None:
        return {"error": "This plot is already planted"}

    item_name = crop

    inventory = (
        db.query(Inventory)
        .filter(
            Inventory.farm_id == farm.id,
            Inventory.item == item_name,
            Inventory.type == "seed",
        )
        .first()
    )

    if inventory is None or inventory.quantity <= 0:
        return {"error": f"No {item_name} seed"}

    inventory.quantity -= 1
    plot.crop = crop
    plot.growth = 0.0

    db.commit()
    db.refresh(plot)
    db.refresh(inventory)

    return {
        "message": f"Planted {crop}",
        "plot_id": plot.id,
        "crop": plot.crop,
        "growth": plot.growth,
        "remaining_seeds": inventory.quantity,
    }


@router.post("/plots/{plot_id}/fertilize")
def fertilize_plot(plot_id: int, farm_id: int, db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()

    if farm is None:
        return {"error": "Farm not found"}

    plot = db.query(Plot).filter(Plot.farm_id == farm.id, Plot.id == plot_id).first()

    if plot is None:
        return {"error": "Plot not found"}

    inventory = (
        db.query(Inventory)
        .filter(
            Inventory.farm_id == farm.id,
            Inventory.item == "fertilizer",
            Inventory.type == "item",
        )
        .first()
    )

    if inventory is None or inventory.quantity <= 0:
        return {"error": "No fertilizer"}

    if plot.fertilizer_days < 10:
        inventory.quantity -= 1
        plot.fertilizer_days = 10

    db.commit()

    db.refresh(plot)
    db.refresh(inventory)

    return {
        "message": "Fertilizer applied",
        "plot_id": plot_id,
        "fertilizer_days": plot.fertilizer_days,
        "remaining fertilizer": inventory.quantity,
    }

@router.post("/plots/fertilize-all")
def fertilize_all(farm_id: int, db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()

    if farm is None:
        return {"error": "Farm not found"}

    inventory = (
        db.query(Inventory)
        .filter(
            Inventory.farm_id == farm.id,
            Inventory.item == "fertilizer",
            Inventory.type == "item",
        )
        .first()
    )

    if inventory is None or inventory.quantity <= 0:
        return {"error": "No fertilizer"}

    plots = (
        db.query(Plot)
        .filter(Plot.farm_id == farm.id)
        .all()
    )

    inventory.quantity -= 1

    for plot in plots:
        plot.fertilizer_days = 10

    db.commit()

    db.refresh(inventory)

    return {
        "message": "Fertilizer applied to all plots",
        "plots": len(plots),
        "remaining_fertilizer": inventory.quantity,
    }


@router.post("/plots/{plot_id}/harvest")
def harvest_crop(plot_id: int, farm_id: int, db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()

    if farm is None:
        return {"error": "Farm not found"}

    plot = db.query(Plot).filter(Plot.farm_id == farm.id, Plot.id == plot_id).first()

    if plot is None:
        return {"error": "Plot not found"}

    if plot.crop is None:
        return {"error": "this plot is empty"}

    crop = plot.crop

    if crop not in CROPS:
        return {"error": "Unknown crop"}

    if plot.growth < 1.0:
        return {"error": "The crop is not ready"}

    inventory = (
        db.query(Inventory)
        .filter(
            Inventory.farm_id == farm.id,
            Inventory.item == crop,
            Inventory.type == "crop",
        )
        .first()
    )

    if inventory is None:
        inventory = Inventory(farm_id=farm.id, item=crop, type="crop", quantity=0)
        db.add(inventory)

    harvest_amount = calculate_harvest_amount(crop, plot.fertilizer_multiplier, plot.weather_multiplier)
    inventory.quantity = round(inventory.quantity + harvest_amount, 2)

    plot.crop = None
    plot.growth = 0.0
    plot.fertilizer_multiplier = 1.0
    plot.weather_multiplier = 1.0

    db.commit()

    db.refresh(inventory)
    db.refresh(plot)

    return {
        "message": f"Harvested {crop}",
        "item": crop,
        "harvest_amount": harvest_amount,
        "quantity": inventory.quantity,
        "plot_id": plot.id,
    }
