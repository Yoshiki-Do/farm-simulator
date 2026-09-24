from sqlalchemy import Column, Integer, Float, String
from .database import Base


class Farm(Base):
    __tablename__ = "farm"

    id = Column(Integer, primary_key=True, index=True)
    day = Column(Integer, default=1)
    money = Column(Float, default=100.0)
    game_over = Column(Integer, default=0)


class Plot(Base):
    __tablename__ = "plots"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, nullable=False)
    crop = Column(String, nullable=True)
    growth = Column(Float, default=0.0)
    fertilizer_days = Column(Float, default=0.0)
    fertilizer_multiplier = Column(Float, default=1.0)
    weather_multiplier = Column(Float, default=1.0)


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, nullable=False)
    item = Column(String, nullable=False)
    type = Column(String, nullable=False)
    quantity = Column(Float, default=0.0)


class MarketPrice(Base):
    __tablename__ = "market_price"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, nullable=False)
    item = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    day = Column(Integer, nullable=False)


class DailySales(Base):
    __tablename__ = "daily_sales"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, nullable=False)
    item = Column(String, nullable=False)
    day = Column(Integer, nullable=False)
    amount = Column(Float, default=0.0)


class Mission(Base):
    __tablename__ = "mission"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, nullable=False)
    item = Column(String, nullable=False)
    start_day = Column(Integer, nullable=False)
    deadline = Column(Integer, nullable=False)
    amount = Column(Float, default=0.0)
    completed = Column(Integer, default=0)
