async function loadInventory(data = null) {
    if (data === null) {
        data = await getFarmData();
    }

    const container = document.getElementById("inventory-items");
    container.innerHTML = "";

    const seeds = data.inventory
        .filter(item => item.type === "seed" && item.quantity > 0)
        .sort((a, b) => a.name.localeCompare(b.name));

    const crops = data.inventory
        .filter(item => item.type === "crop")
        .sort((a, b) => a.name.localeCompare(b.name));

    const items = data.inventory
        .filter(item => item.type === "item")
        .sort((a, b) => a.name.localeCompare(b.name));

    if(seeds.length > 0) {
        const seedTitle = document.createElement("h3");
        seedTitle.textContent = "Seeds";
        container.appendChild(seedTitle);

        seeds.forEach(item => {
            const element = document.createElement("div");
            element.className = "inventory-item";
            element.innerHTML = `
                <div class="inventory-image">
                    <img src="/static/images/${item.item}/${item.item}_seed.png">
                    <strong>x ${item.quantity}</strong>
                </div>`;
            container.appendChild(element);
        });
    }

    if(crops.length > 0) {
        const cropTitle = document.createElement("h3");
        cropTitle.textContent = "Crops";
        container.appendChild(cropTitle);

        crops.forEach(item => {
            const element = document.createElement("div");
            element.className = "inventory-item";

            element.innerHTML = `
                <div class="inventory-image">
                    <img src="/static/images/${item.item}/${item.item}.png">
                    <strong>${item.quantity.toFixed(2)}kg</strong>
                </div>`;
            
            container.appendChild(element);
        });
    }

    if(items.length > 0) {
        const itemTitle = document.createElement("h3");
        itemTitle.textContent = "Items";
        container.appendChild(itemTitle);

        items.forEach(item => {
            const element = document.createElement("div");
            element.className = "inventory-item";
            element.innerHTML = `
                <div class="inventory-image">
                    <img src="/static/images/items/${item.item}.png">
                    <strong>x ${item.quantity}</strong>
                </div>`;
            container.appendChild(element);
        });
    }
    
}