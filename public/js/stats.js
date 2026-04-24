const API_URL = "http://localhost:3000/api/stats";

const iduser = sessionStorage.getItem("iduser");
const userType = sessionStorage.getItem("userType");
const companyId = sessionStorage.getItem("companyId");

async function loadCards() {
    try {
        console.log(iduser, userType, companyId);
        const res = await fetch(`${API_URL}/cards`, {
            headers: {
                "Content-Type": "application/json",
                "iduser": iduser,
                "usertype": userType,
                "companyid": companyId
            }
        });
        const data = await res.json();

        document.getElementById("card1-value").textContent = data.users;
        document.getElementById("card2-value").textContent = data.games;
        document.getElementById("card3-value").textContent = data.avgTime + " min";
        document.getElementById("card4-value").textContent = data.performance + "%";

    } catch (error) {
        console.error("Error cargando cards:", error);
    }
}


async function loadBarChart() {
    try {
        const res = await fetch(`${API_URL}/performance-by-company`, {
            headers: {
            "Content-Type": "application/json",
            "iduser": iduser,
            "usertype": userType,
            "companyid": companyId
            }
        });
        const data = await res.json();

        const ctx = document.getElementById("barChart");

        new Chart(ctx, {
            type: "bar",
            data: {
                labels: data.labels,
                datasets: [{
                    label: "Avg Score",
                    data: data.values,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true
                    }
                }
            }
        });

    } catch (error) {
        console.error("Error en bar chart:", error);
    }
}


async function loadPieChart() {
    try {
        const res = await fetch(`${API_URL}/task-outcomes`, {
            headers: {
            "Content-Type": "application/json",
            "iduser": iduser,
            "usertype": userType,
            "companyid": companyId
            }
        });
        const data = await res.json();

        const ctx = document.getElementById("pieChart");

        new Chart(ctx, {
            type: "pie",
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values
                }]
            },
            options: {
                responsive: true
            }
        });

    } catch (error) {
        console.error("Error en pie chart:", error);
    }
}


document.addEventListener("DOMContentLoaded", () => {
    loadCards();
    loadBarChart();
    loadPieChart();
});