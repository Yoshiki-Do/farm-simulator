from .items import CROPS
import random

MARKET_MIN_MULTIPLIER = 0.5
MARKET_MAX_MULTIPLIER = 3


def calculate_daily_growth(growth_rate, fertilizer=False):
    growth = growth_rate + random.uniform(-0.05, 0.05)
    if fertilizer:
        growth *= random.uniform(1.1, 2.0)
    return growth


def calculate_fertilizer_multiplier():
    return random.uniform(1.1, 1.5)


def calculate_harvest_amount(crop, fertilizer_multiplier=1.0):
    base_amount = CROPS[crop]["base_harvest_amount"]
    variation = random.uniform(0.5, 2.0)
    return round(base_amount * variation * fertilizer_multiplier, 2)


def calculate_market_price(previous_price, sold_amount):
    BASE_DEMAND, BASE_SUPPLY = 500, 495
    demand = BASE_DEMAND * (1 + random.uniform(-0.05, 0.05))
    supply = BASE_SUPPLY * (1 + random.uniform(-0.05, 0.05)) + sold_amount

    market_price = previous_price * (demand / supply)

    return round(market_price, 2)
