from fastapi import FastAPI
from .database import Base, engine
from .routes import farm, market, shop, plot
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI(title="Farm Simulator API")
app.include_router(farm.router)
app.include_router(market.router)
app.include_router(shop.router)
app.include_router(plot.router)
app.mount("/static", StaticFiles(directory="static"), name="static")

Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return FileResponse("static/html/home.html")


@app.get("/game")
def game():
    return FileResponse("static/html/farm.html")


@app.get("/market-page")
def market_page():
    return FileResponse("static/html/market.html")

@app.get("/game-over")
def game_over():
    return FileResponse("static/html/game-over.html")
