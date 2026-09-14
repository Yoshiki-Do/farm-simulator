let currentCrop = "carrot"

async function loadFarmInfo() {
    const data = await getFarmData();

    if (data === null) {
        return;
    }

    document.getElementById("current-day").textContent = data.day;
    document.getElementById("current-money").textContent = Number(data.money).toFixed(2);
}

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
    ctx.font = "14px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        "Day",
        width / 2,
        height - 15
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

    const tickInterval = Math.ceil(history.length / 6);
    history.forEach((item, index) => {

        if (index % tickInterval !== 0 && index !== history.length - 1) {
            return;
        }

        const x =
            padding +
            index *
            ((width - padding * 2) /
            Math.max(history.length - 1, 1));

        ctx.fillText(
            `Day ${item.day}`,
            x,
            height - padding + 20
        );
    });

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

loadFarmInfo();
loadMissions();
loadMarket();
loadHistory();