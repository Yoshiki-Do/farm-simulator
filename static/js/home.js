async function loadSaves() {
    const data = await apiRequest("/farms");

    if(data === null) {
        return;
    }

    const container = document.getElementById("save-slots");
    const template = document.getElementById("save-slot-template");

    container.innerHTML = "";

    for (let i = 1; i <= 3; i++) {
        const slot = template.content.firstElementChild.cloneNode(true);

        slot.id = `save-${i}`;
        slot.querySelector("h2").textContent =`Save ${i}`;
        
        container.appendChild(slot);

        const farm = data.find(farm => farm.id === i);

        if(farm) {
            slot.querySelector(".save-year").textContent = `Year: ${farm.year}`;

            const seasonDay = slot.querySelector(".save-season-day");
            seasonDay.innerHTML = `
                <img class="save-season-image" src="/static/images/seasons/${farm.season}.png" alt="Season">
                Day ${farm.season_day}
            `;
            
            slot.querySelector(".save-money").textContent = `Money: $${Number(farm.money).toFixed(2)}`;

            const buttons = slot.querySelectorAll("button");

            buttons[0].onclick = () => {
                localStorage.setItem("farmId", farm.id);
                location.href = "/game";
            };
            buttons[1].onclick = () => deleteGame(farm.id);

        } else {
            slot.querySelector(".save-year").textContent = "Empty";
            slot.querySelector(".save-season-day").textContent = "";
            slot.querySelector(".save-money").textContent = "";

            const buttons = slot.querySelectorAll("button");
            
            buttons[0].textContent = "New Game";
            buttons[1].style.display = "none"

            buttons[0].onclick = () => createNewGame(i);
        }
    }
}

async function createNewGame(farmId) {
    const data = await apiRequest(`/farms/${farmId}`, {method: "POST"});

    if(data === null) {
        return;
    }

    localStorage.setItem("farmId", farmId);
    location.href = "/game";
}

async function deleteGame(farmId) {
    const confirmed = confirm("Are you sure you want to delete this save?");

    if(!confirmed) {
        return;
    }

    const data = await apiRequest(`/farms/${farmId}`, {method: "DELETE"});

    if(data === null) {
        return;
    }

    loadSaves();

    
}

loadSaves();