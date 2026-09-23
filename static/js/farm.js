let selectedPlant = null;

async function initializeGame() {
    const data = await getFarmData();

    document.getElementById("farm-info").innerHTML = createFarmInfo();

    await loadFarm(data);
    await loadInventory(data);
    await loadMarket();
    await loadMissions();
}

async function nextDay() {
    const farmId = localStorage.getItem("farmId");
    const data = await apiRequest(`/farm/next-day?farm_id=${farmId}`, {method: "POST"});
    
    if (data === null) {
        return;
    }

    if (data.game_over === 1) {
        location.href = "/game-over/";
        return;
    }

    await refreshFarm();
    await loadMarket();
    await loadMissions();

}

function selectPlant(crop) {
    selectedPlant = crop;
}

async function refreshFarm() {
    await loadFarm();
    await loadInventory();
}

async function loadFarm(data = null) {
    if(data === null) {
        data = await getFarmData();
    }
    
    loadFarmInfo(data);

    if (data.game_over === 1){
        alert("Game Over");
        return;
    }

    const container = document.getElementById("farm-grid");
    container.innerHTML = "";

    data.plots.forEach(plot => {
        const element = createPlotElement(plot);
        container.appendChild(element);
    });

    loadPlantButtons(data);
}

function createPlotElement(plot) {
    const template = document.getElementById("farm-plot-template");
    const element = template.content.firstElementChild.cloneNode(true);

    const cropName = element.querySelector(".plot-crop-name");
    const image = element.querySelector(".crop-image");
    const fertilizerProgress = element.querySelector(".fertilizer-progress");
    const growthBar = element.querySelector(".growth-bar");
    const growthProgress = element.querySelector(".growth-progress");
    const growthPercentElement = element.querySelector(".growth-percent");

    if(plot.fertilizer_days > 0) {
        fertilizerProgress.style.width = `${(plot.fertilizer_days / 10) * 100}%`;
    } else {
        fertilizerProgress.parentElement.style.display = "none";
    }

    if(plot.crop == null) {
        cropName.innerHTML = "&nbsp;";
        image.src ="/static/images/soil.png?";
        growthBar.style.display = "none";
        growthPercentElement.innerHTML = "&nbsp;";
    } else {
        const growthPercent = Math.min(1, Math.max(0, plot.growth)) * 100;
        const cropImage = getCropImage(plot.crop, growthPercent);

        cropName.textContent = plot.crop;

        image.src = `/static/images/${plot.crop}/${cropImage}?`;
        growthPercentElement.textContent = `${Math.floor(growthPercent)}%`;
        growthProgress.style.width = `${growthPercent}%`;

        if(growthPercent >= 100) {
            element.classList.add("ready");
            growthProgress.classList.add("ready");
        }
    }

    element.onclick = async function() {
        if(plot.crop == null && selectedPlant !== null) {
            await plantCrop(plot.id);
        } else if(plot.crop != null && plot.growth >= 1) {
            await harvestCrop(plot.id);
        }
    };

    return element;
}

function loadPlantButtons(data) {
    const container = document.getElementById("plant-controls");
    container.innerHTML = "";

    const seeds = data.inventory.filter(item => item.type === "seed" && item.quantity > 0);

    seeds.forEach(item => {
        const button = createPlantButton(item, data);
        container.appendChild(button);
    });
}

function createPlantButton(item, data) {
    const button = document.createElement("button");
    button.textContent = item.name;

    if(item.item === selectedPlant) {
        button.classList.add("selected");
    }

    button.onclick = () => {
        selectPlant(item.item);
        loadPlantButtons(data);
    };

    return button;
}

function getCropImage(crop, growthPercent) {
    if(growthPercent === 0) {
        return `${crop}_seedling.png`;
    }
    else if(growthPercent < 50) {
        return `${crop}_growing_1.png`;
    }
    else if(growthPercent < 100){
        return `${crop}_growing_2.png`;
    }
    else {
        return `${crop}_ready.png`;
    }
}

async function plantCrop(plotId) {
    const farmId = localStorage.getItem("farmId");
    const data = await apiRequest(`/plots/${plotId}/plant/${selectedPlant}?farm_id=${farmId}`, {method: "POST"});

    if (data === null) {
        return;
    }

    await refreshFarm();
}

async function harvestCrop(plotId) {
    const farmId = localStorage.getItem("farmId");
    const data = await apiRequest(`/plots/${plotId}/harvest?farm_id=${farmId}`, {method: "POST"});
    
    if (data === null) {
        return;
    }

    await refreshFarm();
}

async function fertilizePlot() {
    const farmId = localStorage.getItem("farmId");
    const data = await apiRequest(`/plots/fertilize-all?farm_id=${farmId}`, {method: "POST"});

    if (data === null) {
        return;
    }

    await refreshFarm();
}

initializeGame();