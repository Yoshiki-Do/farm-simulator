async function getFarmData() {
    const farmId = localStorage.getItem("farmId");
    return await apiRequest(`/farm/${farmId}`);
}

async function getMarketData() {
    const farmId = localStorage.getItem("farmId");
    return await apiRequest(`/market?farm_id=${farmId}`);
}

function createFarmInfo() {
    return `
        <div class="status-bar">
            <h2>Farm Info</h2>

            <div class="status-box">
                <div class="status-item">
                    <strong id="current-year">-</strong>
                </div>

                <div class="status-item season-info">
                    <img id="current-season-image" src="/static/images/seasons/spring.png" alt="Season">
                    <strong id="current-season-day">-</strong>
                </div>

                <div class="status-item">
                    <span>Money:</span>
                    <strong>$<span id="current-money">-</span></strong>
                </div>
            </div>
        </div>
    `;
}

function createMissions() {
    return `
        <div class="missions-box">
            <div class="missions">
                <h2>Missions</h2>
                <div id="missions-list">Loading...</div>
            </div>
        </div>
    `;
}

function createMarket() {
    return `
        <div class="market">
            <h2>Market Prices</h2>
            <div id="market-prices">Loading...</div>
        </div>
    `;
}

function loadFarmInfo(data){
    document.getElementById("current-year").textContent = `Year: ${data.year}`;

    document.getElementById("current-season-day").textContent =
        `Day ${data.season_day}`;

    document.getElementById("current-season-image").src = `/static/images/seasons/${data.season}.png`;

    document.getElementById("current-money").textContent = Number(data.money).toFixed(2);
}

async function loadMissions() {
    const farmId = localStorage.getItem("farmId");
    const data = await apiRequest(`/farm/${farmId}/missions`);

    if (data === null) {
        return;
    }

    const container = document.getElementById("missions-list");
    container.innerHTML = "";

    if (data.missions.length === 0) {
        container.textContent = "No active missions";
        return;
    }

    data.missions.forEach(mission => {
        const element = document.createElement("div");
        element.className = "mission";

        const remainingDays = Math.max(0, mission.deadline - data.day);
        const dayText = remainingDays === 1 ? "day" : "days";

        let deadlineClass = "";
        const totalDays = mission.deadline - mission.start_day;

        if (remainingDays <= 2) {
            deadlineClass = "deadline-danger";
        } else if (remainingDays <= totalDays / 2) {
            deadlineClass = "deadline-warning";
        }

        element.innerHTML = `
            <div class="mission-title">
                <strong>Sell ${mission.name}</strong>
                <span class="${deadlineClass}">Deadline: ${remainingDays} ${dayText}</span>
            </div>
            <div class="mission-progress">
                <div class="mission-progress-bar" style="width: ${Math.min(100, mission.amount / mission.target * 100)}%"></div>
            </div>
            <div>${mission.amount.toFixed(2)} / ${mission.target.toFixed(2)} kg</div>
        `;

        container.appendChild(element);
    });
    
}