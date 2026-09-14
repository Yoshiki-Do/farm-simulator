async function loadInventory(onSell = null, data = null) {
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
                <span>${item.name} seed</span>
                <strong>x ${item.quantity}</strong>`;
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

            const name = document.createElement("span");
            name.textContent = item.name;

            const quantity = document.createElement("strong");
            quantity.textContent = `${item.quantity.toFixed(2)} kg`;

            element.appendChild(name);
            element.appendChild(quantity);

            if (onSell !== null && item.quantity > 0) {
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

                    onSell(item.item, amount);
                };

                const controls =document.createElement("div");
                controls.className = "inventory-controls";

                controls.appendChild(input);
                controls.appendChild(maxButton);
                controls.appendChild(sellButton);

                element.appendChild(controls);
            }
            
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
                <span>${item.name}</span>
                <strong>x ${item.quantity}</strong>`;
            container.appendChild(element);
        });
    }
    
}