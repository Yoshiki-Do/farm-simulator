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
        const image = element.querySelector(".item-image");
        const name = element.querySelector(".item-name");
        const price = element.querySelector(".item-price");
        const button = element.querySelector("button");

        image.src = `/static/images/${item.item}/${item.item}_seed.png`;
        name.textContent = `${item.name}`;
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

async function loadItemShop() {
    const data = await apiRequest("/shop/items");
    
    if (data === null) {
        return;
    }

    const container = document.getElementById("item-shop-items");
    container.innerHTML = "";

    const template = document.getElementById("shop-item-template");

    data.items.sort((a,b) => a.name.localeCompare(b.name)).forEach(item => {
        const element = template.content.firstElementChild.cloneNode(true);

        const image = element.querySelector(".item-image");
        const name = element.querySelector(".item-name");
        const price = element.querySelector(".item-price");
        const button = element.querySelector("button");

        image.src = `/static/images/items/${item.item}.png`;
        name.textContent = item.name;
        price.textContent = `$${item.price}`;

        button.textContent = "Buy 1";
        button.onclick = () => buyItem(item.item);

        const buy10Button = document.createElement("button");
        buy10Button.textContent = "Buy 10";
        buy10Button.onclick = () => buy10Items(item.item);

        element.appendChild(buy10Button);

        container.appendChild(element);
    });
}

async function buyItem(item) {
    const farmId = localStorage.getItem("farmId");
    const data = await apiRequest(`/shop/buy-item/${item}?farm_id=${farmId}`, {method: "POST"});

    if(data === null) {
        return;
    }

    await loadShopInfo();
    await loadInventory();
}

async function buy10Items(item) {
    const farmId = localStorage.getItem("farmId");

    const data = await apiRequest(`/shop/buy-item/${item}/10?farm_id=${farmId}`, {method: "POST"}
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
loadItemShop();