async function loadShopInfo() {
    const data = await getFarmData();
    document.getElementById("current-day").textContent = data.day;
    document.getElementById("current-money-left").textContent = Number(data.money).toFixed(2);
}

async function loadSeedShop() {
    const data = await apiRequest("/shop/seeds");

    if (data === null) {
        return;
    }

    const container = document.getElementById("seed-shop-items");
    container.innerHTML = "";

    const template = document.getElementById("shop-item-template");

    data.seeds.sort((a, b) => a.name.localeCompare(b.name)).forEach(item => {
        const element = template.content.firstElementChild.cloneNode(true);
        const name = element.querySelector(".item-name");
        const price = element.querySelector(".item-price");
        const button = element.querySelector("button");

        name.textContent = `${item.name} seed`;
        price.textContent = `$${item.price}`;

        button.textContent = "Buy 1";
        button.onclick = () => buySeed(item.item);

        const buy10Button = document.createElement("button");
        buy10Button.textContent = "Buy 10";
        buy10Button.onclick = () => buy10Seeds(item.item);

        element.appendChild(buy10Button);

        container.appendChild(element);
            });
}

async function buySeed(crop) {
    const farmId = localStorage.getItem("farmId")
    const data = await apiRequest(`/shop/buy-seed/${crop}?farm_id=${farmId}`, {method: "POST"});

    if(data === null) {
        return;
    }

    await loadShopInfo();
    await loadInventory();
}

async function buy10Seeds(crop) {
    const farmId = localStorage.getItem("farmId");

    const data = await apiRequest(
        `/shop/buy-seed/${crop}/10?farm_id=${farmId}`,
        {method: "POST"}
    );

    if (data === null) {
        return;
    }

    await loadShopInfo();
    await loadInventory();
}

async function loadFertilizerShop() {
    const data = await apiRequest("/shop/fertilizer");
    
    if (data === null) {
        return;
    }

    const container = document.getElementById("fertilizer-shop-items");
    container.innerHTML = "";

    const item = data.fertilizer;

    const template = document.getElementById("shop-item-template");
    const element = template.content.firstElementChild.cloneNode(true);

    const name = element.querySelector(".item-name");
    const price = element.querySelector(".item-price");
    const button = element.querySelector("button");

    name.textContent = item.name;
    price.textContent = `$${item.price}`;

    button.textContent = "Buy 1";
    button.onclick = () => buyFertilizer();

    const buy10Button = document.createElement("button");
    buy10Button.textContent = "Buy 10";
    buy10Button.onclick = () => buy10Fertilizers();

    element.appendChild(buy10Button);

    container.appendChild(element);
}

async function buyFertilizer() {
    const farmId = localStorage.getItem("farmId");
    const data = await apiRequest(`/shop/buy-fertilizer?farm_id=${farmId}`, {method: "POST"});

    if(data === null) {
        return;
    }

    await loadShopInfo();
    await loadInventory();
}

async function buy10Fertilizers() {
    const farmId = localStorage.getItem("farmId");

    const data = await apiRequest(
        `/shop/buy-fertilizer/10?farm_id=${farmId}`,
        {method: "POST"}
    );

    if (data === null) {
        return;
    }

    await loadShopInfo();
    await loadInventory();
}

loadShopInfo();
loadInventory();
loadMissions();
loadMarket();
loadSeedShop();
loadFertilizerShop();