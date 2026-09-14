async function getFarmData() {
    const farmId = localStorage.getItem("farmId");
    return await apiRequest(`/farm/${farmId}`);
}

async function getMarketData() {
    const farmId = localStorage.getItem("farmId");
    return await apiRequest(`/market?farm_id=${farmId}`);
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