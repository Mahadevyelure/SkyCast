const API_KEY = "5e937f267a45526a81a160d5816f0891";

// ================= CURRENT WEATHER =================
async function getWeather(cityName) {
    const city = cityName || document.getElementById("cityInput").value.trim();
    if (!city) return alert("Enter city name");

    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        const data = await res.json();

        if (data.cod !== 200) return alert(data.message);

        // Update main weather section
        document.getElementById("location").innerText =
            `${data.name}, ${data.sys.country}`;
        document.getElementById("temp").innerText =
            `${Math.round(data.main.temp)}°C`;
        document.getElementById("condition").innerText =
            data.weather[0].description;
        document.getElementById("icon").src =
            `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        document.getElementById("insight").innerText =
            getInsight(data.weather[0].main);

        // Save search history
        saveHistory(city);

        // Load 7-day forecast chart
        get7DayForecast(city);

    } catch (error) {
        console.error("Error fetching current weather:", error);
        alert("Failed to fetch weather data. Try again.");
    }
}

// ================= INSIGHT =================
function getInsight(condition) {
    if (condition.includes("Rain")) return "Carry an umbrella ☔";
    if (condition.includes("Clear")) return "Great day to go outside 🌞";
    if (condition.includes("Cloud")) return "Mild and pleasant 🌥";
    return "Stay safe and prepared 😊";
}

// ================= SEARCH HISTORY =================
function saveHistory(city) {
    let history = JSON.parse(localStorage.getItem("history")) || [];
    if (!history.includes(city)) {
        history.unshift(city);
        if (history.length > 5) history.pop();
    }
    localStorage.setItem("history", JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const historyDiv = document.getElementById("history");
    historyDiv.innerHTML = "";
    const history = JSON.parse(localStorage.getItem("history")) || [];

    history.forEach(city => {
        historyDiv.innerHTML += `
            <div class="card" onclick="getWeather('${city}')">
                ${city}
            </div>`;
    });
}

// ================= FAMOUS CITIES =================
const famousCities = [
    "Mumbai",       // Maharashtra
    "Delhi",        // Capital
    "Bengaluru",    // Karnataka
    "Hyderabad",    // Telangana
    "Ahmedabad",    // Gujarat
    "Chennai",      // Tamil Nadu
    "Kolkata",      // West Bengal
    "Pune",         // Maharashtra
    "Jaipur",       // Rajasthan
    "Noida",        // Uttar Pradesh
    "Lucknow",      // Uttar Pradesh
    "Kanpur",       // Uttar Pradesh
    "Surat",        // Gujarat
    "Bhopal",       // Madhya Pradesh
    "Visakhapatnam" // Andhra Pradesh
];


async function loadFamousCities() {
    const container = document.getElementById("famousCities");
    container.innerHTML = ""; // clear before loading

    for (let city of famousCities) {
        try {
            const res = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
            );
            const data = await res.json();

            container.innerHTML += `
                <div class="card" onclick="getWeather('${city}')">
                    <h4>${city}</h4>
                    <h2>${Math.round(data.main.temp)}°C</h2>
                    <p>${data.weather[0].main}</p>
                </div>`;
        } catch (error) {
            console.error(`Error fetching ${city} weather:`, error);
        }
    }
}

// ================= 7-DAY FORECAST =================
let chart; // global chart variable

async function get7DayForecast(city) {
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
        );
        const data = await res.json();

        if (data.cod !== "200") return;

        // Collect 1 temperature per day
        const dailyData = {};
        data.list.forEach(item => {
            const date = item.dt_txt.split(" ")[0];
            if (!dailyData[date]) {
                dailyData[date] = item.main.temp;
            }
        });

        const labels = Object.keys(dailyData).slice(0, 7);
        const temps = Object.values(dailyData).slice(0, 7);

        drawChart(labels, temps);

    } catch (error) {
        console.error("Error fetching 7-day forecast:", error);
    }
}

// ================= CHART =================
function drawChart(labels, temps) {
    const ctx = document.getElementById("tempChart").getContext("2d");

    if (chart) chart.destroy(); // prevent overlap

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Temperature (°C)",
                data: temps,
                tension: 0.4,
                fill: true,
                backgroundColor: "rgba(255,165,0,0.2)",
                borderColor: "rgba(255,165,0,1)",
                borderWidth: 2,
                pointBackgroundColor: "orange",
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// ================= INIT =================
renderHistory();
loadFamousCities();
