from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
import random
from ..game_logic import (
    MARKET_MIN_MULTIPLIER,
    MARKET_MAX_MULTIPLIER,
    calculate_market_price,
    get_season,
)
from ..items import CROPS
from ..mission import check_mission, update_mission_progress
from ..models import Farm, Inventory, MarketPrice, DailySales

router = APIRouter()


@router.get("/market/crops")
def get_crops():
    return [
        {
            "item": key,
            "name": data["name"],
        }
        for key, data in CROPS.items()
    ]


@router.post("/market/sell/{item}")
def sell_item(item: str, amount: float, farm_id: int, db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()

    if farm is None:
        return {"error": "Farm not found"}

    inventory = (
        db.query(Inventory)
        .filter(
            Inventory.farm_id == farm.id,
            Inventory.item == item,
            Inventory.type == "crop",
        )
        .first()
    )

    if inventory is None or inventory.quantity <= 0:
        return {"error": f"No {item} in inventory"}

    amount = round(amount, 2)

    if amount <= 0:
        return {"error": "Amount must be greater than 0"}

    if amount > round(inventory.quantity, 2):
        return {"error": "Not enough crop in inventory"}

    market_price = (
        db.query(MarketPrice)
        .filter(
            MarketPrice.farm_id == farm.id,
            MarketPrice.item == item,
            MarketPrice.day == farm.day,
        )
        .first()
    )
    if market_price is None:
        return {"error": "Market price not found"}

    sell_price = market_price.price
    total_price = sell_price * amount

    inventory.quantity = round(inventory.quantity - amount, 2)
    farm.money = round(farm.money + total_price, 2)

    daily_sales = (
        db.query(DailySales)
        .filter(
            DailySales.farm_id == farm.id,
            DailySales.item == item,
            DailySales.day == farm.day,
        )
        .first()
    )

    if daily_sales is None:
        daily_sales = DailySales(
            farm_id=farm.id, item=item, day=farm.day, amount=amount
        )
        db.add(daily_sales)
    else:
        daily_sales.amount += amount

    update_mission_progress(db, farm, item, amount)

    db.commit()

    db.refresh(farm)
    db.refresh(inventory)

    return {
        "message": f"Sold {amount} kg of {item}",
        "item": item,
        "sold_amount": amount,
        "price_per_kg": sell_price,
        "total_price": round(total_price, 2),
        "remaining": round(inventory.quantity, 2),
        "money": round(farm.money, 2),
    }


@router.get("/market")
def get_market(farm_id: int, db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()

    if farm is None:
        return {"error": "Farm not found"}

    prices = (
        db.query(MarketPrice)
        .filter(MarketPrice.farm_id == farm.id, MarketPrice.day == farm.day)
        .all()
    )

    if len(prices) == 0:
        generate_market_prices(db, farm)

        prices = (
            db.query(MarketPrice)
            .filter(MarketPrice.farm_id == farm.id, MarketPrice.day == farm.day)
            .all()
        )

    return {
        "day": farm.day,
        "prices": [
            {
                "item": price.item,
                "name": CROPS[price.item]["name"],
                "price": price.price,
            }
            for price in prices
        ],
    }


@router.get("/market/history/{item}")
def get_market_history(item: str, farm_id: int, db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()

    if farm is None:
        return {"error": "Farm not found"}

    if item not in CROPS:
        return {"error": "Unknown item"}

    prices = (
        db.query(MarketPrice)
        .filter(MarketPrice.farm_id == farm.id, MarketPrice.item == item)
        .order_by(MarketPrice.day.asc())
        .all()
    )

    max_price = round(CROPS[item]["base_price"] * MARKET_MAX_MULTIPLIER)

    return {
        "item": item,
        "name": CROPS[item]["name"],
        "max_price": max_price,
        "current_day": farm.day,
        "history": [{"day": price.day, "price": price.price} for price in prices],
    }


def generate_market_prices(db, farm):
    for item, data in CROPS.items():
        base_price = data["base_price"]
        previous_price = (
            db.query(MarketPrice)
            .filter(
                MarketPrice.farm_id == farm.id,
                MarketPrice.item == item,
                MarketPrice.day < farm.day,
            )
            .order_by(MarketPrice.day.desc())
            .first()
        )

        previous_sales = (
            db.query(DailySales)
            .filter(
                DailySales.farm_id == farm.id,
                DailySales.item == item,
                DailySales.day == farm.day - 1,
            )
            .first()
        )

        sold_amount = previous_sales.amount if previous_sales else 0.0

        current_season =get_season(farm.day)

        if current_season in data["seasons"]:
            if previous_price is None:
                price = calculate_market_price(base_price, sold_amount)
            else:
                price = calculate_market_price(previous_price.price, sold_amount)

            min_price = round(data["base_price"] * MARKET_MIN_MULTIPLIER, 2)
            max_price = round(data["base_price"] * MARKET_MAX_MULTIPLIER, 2)

            price = round(max(min_price, min(price, max_price)), 2)

        else:
            price = round(base_price * random.uniform(2, 2.2), 2)

        market_price = MarketPrice(
            farm_id=farm.id, item=item, price=price, day=farm.day
        )
        db.add(market_price)

        check_mission(db, farm, item, price)

    db.commit()

    oldest_day = farm.day - 59
    db.query(MarketPrice).filter(
        MarketPrice.farm_id == farm.id, MarketPrice.day < oldest_day
    ).delete(synchronize_session=False)
    db.commit()
