async function loadSaves() {
    const data = await apiRequest("/farms");

    if(data === null) {
        return;
    }

    for (let i = 1; i <= 3; i++) {
        const slot = document.getElementById(`save-${i}`);

        if(slot === null) {
            continue;
        }

        const farm = data.find(farm => farm.id === i);

        if(farm) {
            slot.querySelector(".save-day").textContent = `Day ${farm.day}`;
            slot.querySelector(".save-money").textContent = `$${Number(farm.money).toFixed(2)}`;

            const buttons = slot.querySelectorAll("button");

            buttons[0].onclick = () => {
                localStorage.setItem("farmId", farm.id);
                location.href = "/game";
            };
            buttons[1].onclick = () => deleteGame(farm.id);

        } else {
            slot.querySelector(".save-day").textContent = "Empty";
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