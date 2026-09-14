async function loadMarket() {
    const data = await getMarketData();
    const container = document.getElementById("market-prices");

    container.innerHTML = "";

    data.prices.sort((a, b) => a.name.localeCompare(b.name)).forEach(item => {
        const element = document.createElement("div");
        element.className = "market-price";
        element.innerHTML = `
            <div class="market-item-info">
                <img src="/static/images/${item.item}/${item.item}.png">
                <span>${item.name}</span>
            </div>
            <span>$${item.price.toFixed(2)} /kg</span>
        `;

        element.onclick = () => selectCrop(item.item);
        
        container.appendChild(element)
    });
}