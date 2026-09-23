from sqlalchemy.orm import Session
from .game_logic import get_season
from .items import CROPS
from .models import Farm, Mission, Inventory

MISSION_THRESHOLD = 2
DEADLINE = 14
MISSION_AMOUNT = 100.0


def check_mission(db: Session, farm: Farm, item: str, price: float):
    current_season = get_season(farm.day)
    
    if current_season not in CROPS[item]["seasons"]:
        return
    
    base_price = CROPS[item]["base_price"]
    mission_threshold = round(base_price * MISSION_THRESHOLD, 2)

    if price < mission_threshold:
        return

    mission = (
        db.query(Mission)
        .filter(
            Mission.farm_id == farm.id,
            Mission.item == item,
            Mission.completed == 0,
            Mission.deadline >= farm.day,
        )
        .first()
    )

    if mission is not None:
        return

    mission = Mission(
        farm_id=farm.id,
        item=item,
        start_day=farm.day,
        deadline=farm.day + DEADLINE,
        amount=0.0,
        completed=0,
    )

    db.add(mission)


def check_mission_deadline(db: Session, farm: Farm):
    mission = (
        db.query(Mission)
        .filter(
            Mission.farm_id == farm.id,
            Mission.completed == 0,
            Mission.deadline < farm.day,
        )
        .all()
    )

    if not mission:
        return

    farm.game_over = 1


def update_mission_progress(db: Session, farm: Farm, item: str, amount: float):
    mission = (
        db.query(Mission)
        .filter(
            Mission.farm_id == farm.id,
            Mission.item == item,
            Mission.completed == 0,
            Mission.deadline >= farm.day,
        )
        .first()
    )

    if mission is None:
        return

    mission.amount = round(mission.amount + amount, 2)

    if mission.amount >= MISSION_AMOUNT:
        mission.completed = 1

        fertilizer = (
            db.query(Inventory)
            .filter(
                Inventory.farm_id == farm.id,
                Inventory.item == "fertilizer",
                Inventory.type == "item",
            )
            .first()
        )

        if fertilizer is None:
            fertilizer = Inventory(
                farm_id=farm.id, item="fertilizer", type="item", quantity=5
            )
            db.add(fertilizer)
        else:
            fertilizer.quantity += 1
