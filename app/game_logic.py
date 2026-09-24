from .items import CROPS
import random

MARKET_MIN_MULTIPLIER = 0.5
MARKET_MAX_MULTIPLIER = 3
WEATHER_PROBABILITIES = {
    "spring": {"sunny": 0.40, "cloudy":0.25,"rainy":0.30,"snowy":0.01,"windy":0.04},
    "summer": {"sunny": 0.60, "cloudy":0.20,"rainy":0.10,"snowy":0.00,"windy":0.05},
    "fall": {"sunny": 0.40, "cloudy":0.25,"rainy":0.25,"snowy":0.01,"windy":0.04},
    "winter": {"sunny": 0.15, "cloudy":0.40,"rainy":0.10,"snowy":0.30,"windy":0.05},
}
WEATHER_GROWTH_MULTIPLIER ={"sunny":1.05,"cloudy":1.00,"rainy":0.90,"snowy":0.80,"windy":0.95}


def calculate_daily_growth(growth_rate, fertilizer=False, weather="cloudy"):
    growth = growth_rate + random.uniform(-0.05, 0.05)

    growth *= WEATHER_GROWTH_MULTIPLIER[weather]

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

def get_weather(season):
    weather = WEATHER_PROBABILITIES[season]
    return random.choices(list(weather.keys()), weights=list(weather.values()), k=1)[0]

def get_season(day:int):
    season_number = ((day - 1) // 30) % 4
    seasons = ["spring", "summer", "fall", "winter"]

    return seasons[season_number]
