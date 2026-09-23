let currentCrop = "carrot"

async function loadHistory() {
    const farmId = localStorage.getItem("farmId");
    const data = await apiRequest(`/market/history/${currentCrop}?farm_id=${farmId}`);
    
    if (data === null) {
        return;
    }

    drawChart(data.history, data.max_price);

    document.getElementById("history-title").textContent = `${data.name} Price History`;

    updatePriceInfo(data.history);

}

function drawChart(history, maxPrice) {

    const canvas = document.getElementById("price-chart");
    const ctx = canvas.getContext("2d");

    const width = canvas.clientWidth || 800;
    const height = 400;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    if (history.length === 0) {
        return;
    }

    const minPrice = 0;
    const chartMax = maxPrice + 2;

    const padding = 70;

    // Draw axes
    ctx.beginPath();

    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);

    ctx.stroke();

    // Draw axis labels
    ctx.font = "12px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        "Day",
        width / 2,
        height - 25
    );

    ctx.save();

    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);

    ctx.fillText(
        "Price ($ / kg)",
        0,
        0
    );

    ctx.restore();

    // Draw Y-axis ticks
    ctx.font = "12px Arial";
    ctx.textAlign = "right";

    const tickCount = 5;
    for (let i = 0; i <= tickCount; i++) {

        const price =
            minPrice +
            (chartMax - minPrice) * (i / tickCount);

        const y =
            height -
            padding -
            (i / tickCount) *
            (height - padding * 2);

        ctx.fillText(
            `$${price.toFixed(2)}`,
            padding - 8,
            y + 4
        );
    }

    // Draw X-axis ticks
    ctx.textAlign = "center";

    const xTickCount = Math.min(history.length, 5);
    for (let i = 0; i < xTickCount; i++) {

    const index = Math.round(
        i * (history.length - 1) / Math.max(xTickCount - 1, 1)
    );

    const item = history[index];

    const x =
        padding +
        index *
        ((width - padding * 2) /
        Math.max(history.length - 1, 1));

    ctx.fillText(
        `${item.day}`,
        x,
        height - padding + 20
    );
}

    // Draw graph
    ctx.beginPath();

    history.forEach((item, index) => {

        const x =
            padding +
            index *
            ((width - padding * 2) /
            Math.max(history.length - 1, 1));

        const y =
            height -
            padding -
            ((item.price - minPrice) /
            Math.max(chartMax - minPrice, 1)) *
            (height - padding * 2);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // Draw points
    history.forEach((item, index) => {

        const x =
            padding +
            index *
            ((width - padding * 2) /
            Math.max(history.length - 1, 1));

        const y =
            height -
            padding -
            ((item.price - minPrice) /
            Math.max(chartMax - minPrice, 1)) *
            (height - padding * 2);

        ctx.beginPath();

        ctx.arc(x, y, 4, 0, Math.PI * 2);

        ctx.fill();
    });
}

async function selectCrop(crop){
    currentCrop = crop;
    await loadHistory();
}

function updatePriceInfo(history) {
    if (history.length === 0) {
        return;
    }

    const prices = history.map(item => item.price);
    const currentPrice = history[history.length - 1].price;
    const highPrice = Math.max(...prices);
    const lowPrice = Math.min(...prices);

    document.getElementById("current-price").textContent = `$${currentPrice.toFixed(2)} /kg`;
    document.getElementById("high-price").textContent = `$${highPrice.toFixed(2)} /kg`;
    document.getElementById("low-price").textContent = `$${lowPrice.toFixed(2)} /kg`;
}

async function loadCrops() {
    const data = await getFarmData();

    if (data === null) {
        return;
    }

    const container = document.getElementById("market-crops");
    container.innerHTML = "";

    const crops = data.inventory
        .filter(item => item.type === "crop" && item.quantity > 0)
        .sort((a, b) => a.name.localeCompare(b.name));
    
        crops.forEach(item => {
            const element = document.createElement("div");
            element.className = "market-crop";

            const image = document.createElement("img");
            image.src = `/static/images/${item.item}/${item.item}.png`;

            const quantity = document.createElement("strong");
            quantity.textContent = `${item.quantity.toFixed(2)} kg`;

            const input = document.createElement("input");
            input.type = "number";
            input.min = 0.01;
            input.max = item.quantity;
            input.step = "0.01";
            input.placeholder = "kg";

            const maxButton = document.createElement("button");
            maxButton.textContent = "Max";

            maxButton.onclick = () => {
                input.value = item.quantity.toFixed(2);
            };

            const sellButton = document.createElement("button");
            sellButton.textContent = "Sell";

            sellButton.onclick = () => {
                const amount = parseFloat(input.value);

                if (isNaN(amount) || amount <= 0) {
                    alert("Enter a valid amount.");
                    return;
                }

                if (amount > item.quantity) {
                    alert("Not enough crop in inventory.");
                    return;
                }

                sellCrop(item.item, amount);
            };

            const controls =document.createElement("div");
            controls.className = "market-crop-controls";

            controls.appendChild(input);
            controls.appendChild(maxButton);
            controls.appendChild(sellButton);

            element.appendChild(image);
            element.appendChild(quantity);
            element.appendChild(controls);

            container.appendChild(element);
        });
}

async function sellCrop(item, amount) {
    const farmId = localStorage.getItem("farmId");
    const data = await apiRequest(`/market/sell/${item}?amount=${amount}&farm_id=${farmId}`, {method: "POST"});

    if (data === null)
        return;

    await loadFarmInfo();
    await loadMissions();
    await loadCrops();
    await loadMarket();
    await loadHistory();
}

async function initializeMarket() {
    const data = await getFarmData();

    if (data === null) {
        return;
    }

    document.getElementById("farm-info").innerHTML = createFarmInfo();

    loadFarmInfo(data);
    await loadMissions();
    await loadMarket();
    await loadHistory();
    await loadCrops();
}

initializeMarket();