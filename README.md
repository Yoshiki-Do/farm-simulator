# Farm Simulator

A browser-based farming simulation game built with **Python, FastAPI, SQLAlchemy, JavaScript, HTML, CSS, and SQLite**.

Players can grow crops, manage inventory, buy and sell items, monitor market prices, and complete missions while managing their farm.

## Features

* 3 independent save slots
* 5 × 5 farm grid with 25 plots
* Plant and harvest crops by clicking plots
* Multiple crops with different growth rates and prices
* Fertilizer system
* Apply fertilizer to all farm plots at once
* Inventory management
* Buy seeds and fertilizer from the shop
* Sell harvested crops
* Dynamic market prices
* 60-day market price history
* Missions based on high market prices
* Mission deadlines and rewards
* Game Over system
* Persistent game data using SQLite

## Crops

| Crop   | Seed Price | Base Market Price |
| ------ | ---------: | ----------------: |
| Carrot |     $10.00 |             $5.50 |
| Tomato |     $10.00 |             $8.00 |
| Potato |     $10.00 |             $5.00 |

## Mission System

Missions are triggered when a crop's market price reaches **2× its base price**.

* Target: 100 kg
* Deadline: 14 days
* Sales can be split across multiple transactions
* Successful completion rewards 5 fertilizer
* Missing the deadline results in Game Over

## Technology Stack

### Backend

* Python
* FastAPI
* SQLAlchemy
* SQLite

### Frontend

* HTML
* CSS
* JavaScript

### Development Tools

* Visual Studio Code
* Git / GitHub

## Project Structure

```text
farm-simulator/
├── app/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── items.py
│   ├── game_logic.py
│   ├── mission.py
│   └── routes/
│       ├── farm.py
│       ├── plot.py
│       ├── market.py
│       └── shop.py
├── static/
│   ├── css/
│   ├── html/
│   ├── images/
│   └── js/
├── requirements.txt
└── .gitignore
```

## How to Run

### 1. Clone the repository

```bash
git clone https://github.com/Yoshiki-Do/farm-simulator.git
cd farm-simulator
```

### 2. Create a virtual environment

Windows:

```powershell
python -m venv .venv
```

### 3. Activate the virtual environment

PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

### 4. Install dependencies

```powershell
pip install -r requirements.txt
```

### 5. Start the server

```powershell
uvicorn app.main:app --reload
```

### 6. Open the game

Open:

```text
http://127.0.0.1:8000
```

## Database

The game uses **SQLite** for persistent game data.

The database is created automatically when the application starts. Database files are excluded from Git using `.gitignore`.

## Development

This project was developed as a personal portfolio project to practice:

* REST API development
* Database design
* SQLAlchemy ORM
* Frontend and backend integration
* Game logic
* State management
* Git and GitHub workflow

## Future Improvements

Possible future improvements include:

* Additional crops and items
* More mission types
* More farm interactions
* Improved UI
* Additional game events
* Player statistics
* Expanded market mechanics
