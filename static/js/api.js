async function apiRequest(url, options = {}) {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok || data.error) {
        alert(data.error || data.detail || "An error occurred.");
        return null;
    }

    return data;
}