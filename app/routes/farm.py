from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .market import generate_market_prices
from ..database import get_db
from ..game_logic import calculate_daily_growth, calculate_fertilizer_multiplier, get_weather, get_season
from ..items import CROPS, ITEMS
from ..mission import MISSION_AMOUNT, check_mission_deadline
from ..models import Farm, Plot, Inventory, MarketPrice, DailySales, Mission

router = APIRouter()

PLOT_NUM = 25


@router.get("/farms")
def get_farms(db: Session = Depends(get_db)):
    farms = db.query(Farm).order_by(Farm.id).all()

    return [
        {
            "id": farm.id,
            "day": farm.day,
            "year": ((farm.day - 1) // 120) + 1,
            "season": get_season(farm.day),
            "season_day": ((farm.day - 1) % 30) + 1,
            "money": farm.money,
        }
        for farm in farms
    ]


@router.post("/farms/{farm_id}")
def create_farm(farm_id: int, db: Session = Depends(get_db)):
    if farm_id < 1 or farm_id > 3:
        return {"error": "Invalid save slot"}

    existing_farm = db.query(Farm).filter(Farm.id == farm_id).first()

    if existing_farm is not None:
        return {"error": "Save slot already exists"}

    farm = Farm(id=farm_id, day=1, money=100)
    db.add(farm)
    db.commit()
    db.refresh(farm)

    for i in range(PLOT_NUM):
        plot = Plot(farm_id=farm.id, crop=None, growth=0.0)
        db.add(plot)

    db.commit()

    generate_market_prices(db, farm)

    return {
        "id": farm.id,
        "day": farm.day,
        "money": farm.money,
        "game_over": farm.game_over,
    }


@router.delete("/farms/{farm_id}")
def delete_farm(farm_id: int, db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()

    if farm is None:
        return {"error": "Farm not found"}

    db.query(Plot).filter(Plot.farm_id == farm_id).delete()
    db.query(Inventory).filter(Inventory.farm_id == farm_id).delete()
    db.query(MarketPrice).filter(MarketPrice.farm_id == farm_id).delete()
    db.query(DailySales).filter(DailySales.farm_id == farm_id).delete()
    db.query(Mission).filter(Mission.farm_id == farm_id).delete()

    db.delete(farm)
    db.commit()

    return {"message": "Farm deleted"}


@router.get("/farm/{farm_id}")
def get_farm(farm_id: int, db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()

    if farm is None:
        return {"error": "Farm not found"}

    plots = db.query(Plot).filter(Plot.farm_id == farm.id).all()

    if len(plots) == 0:
        for i in range(PLOT_NUM):
            plot = Plot(farm_id=farm.id, crop=None, growth=0.0)
            db.add(plot)

        db.commit()
        plots = db.query(Plot).filter(Plot.farm_id == farm.id).all()

    inventory = db.query(Inventory).filter(Inventory.farm_id == farm.id).all()

    result = {
        "id": farm.id,
        "day": farm.day,
        "year": ((farm.day - 1) // 120) + 1,
        "season": get_season(farm.day),
        "season_day": ((farm.day - 1) % 30) + 1,
        "money": farm.money,
        "plots": [
            {
                "id": plot.id,
                "crop": plot.crop,
                "growth": plot.growth,
                "fertilizer_days": plot.fertilizer_days,
            }
            for plot in plots
        ],
        "inventory": [
            {
                "item": item.item,
                "name": (
                    CROPS[item.item]["name"]
                    if item.item in CROPS
                    else ITEMS[item.item]["name"]
                ),
                "type": item.type,
                "quantity": item.quantity,
            }
            for item in inventory
            if item.quantity > 0
        ],
    }

    return result


@router.get("/farm/{farm_id}/missions")
def get_missions(farm_id: int, db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()

    if farm is None:
        return {"error": "Farm not found"}

    missions = (
        db.query(Mission)
        .filter(
            Mission.farm_id == farm.id,
            Mission.completed == 0,
            Mission.deadline >= farm.day,
        )
        .order_by(Mission.id.asc())
        .all()
    )

    return {
        "day": farm.day,
        "missions": [
            {
                "item": mission.item,
                "name": CROPS[mission.item]["name"],
                "start_day": mission.start_day,
                "deadline": mission.deadline,
                "amount": mission.amount,
                "target": MISSION_AMOUNT,
            }
            for mission in missions
        ],
    }


@router.post("/farm/next-day")
def next_day(farm_id: int, db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()

    if farm.game_over == 1:
        return {"error": "Game Over"}

    farm.day += 1

    check_mission_deadline(db, farm)

    current_season = get_season(farm.day)
    weather=get_weather(current_season)

    plots = db.query(Plot).filter(Plot.farm_id == farm.id).all()

    for plot in plots:
        fertilizer = plot.fertilizer_days > 0

        if plot.crop is not None and plot.growth < 1.0:
            growth_rate = CROPS[plot.crop]["growth_rate"]
            daily_growth = calculate_daily_growth(growth_rate, fertilizer,weather)
            if fertilizer:
                daily_multiplier = calculate_fertilizer_multiplier()
                plot.fertilizer_multiplier *= daily_multiplier

            plot.growth = min(1.0, plot.growth + daily_growth)

        plot.fertilizer_days = max(0, plot.fertilizer_days - 1)

    db.commit()

    generate_market_prices(db, farm)

    db.refresh(farm)

    return {"day": farm.day, "money": farm.money, "game_over": farm.game_over}
