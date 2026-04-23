document.addEventListener("DOMContentLoaded", async () => {
    const id = sessionStorage.getItem("iduser");

    if (!id) {
    console.error("No hay ID en sessionStorage");
    return;
}
console.log("SESSION:", sessionStorage);
console.log("ID:", sessionStorage.getItem("iduser"));

try {
    const response = await fetch(`http://localhost:3000/users/profile/${id}`);
    const data = await response.json();
    console.log(data);

    if (response.ok) {
        document.getElementById("username").innerText = data.nickname;
        document.getElementById("country").innerText = data.country;
        document.getElementById("totalScore").innerText = data.total_score;
        document.getElementById("gamesPlayed").innerText = data.games_played;
        document.getElementById("errors").innerText = data.last_errors || 0;
        document.getElementById("days").innerText = data.last_days || 0;
        document.getElementById("status").innerText = data.last_time ? new Date(data.last_time).toLocaleTimeString() : "00:00";

        const score = parseFloat(data.last_score) || 0;
        const maxScorePossible = 100;
        const perf = Math.min((score / maxScorePossible) * 100, 100);

        const fill = document.getElementById("performanceFill");
        document.getElementById("performanceText").innerText = `${perf.toFixed(1)}%`;
        fill.style.width = `${perf}%`;

        if (perf < 25) {
            fill.style.backgroundColor = "#dc3545";
        }
        else if (perf < 50) {
            fill.style.backgroundColor = "#ff8b07";
        }
        else if (perf < 75) {
            fill.style.backgroundColor = "#fffb07";
        }
        else {
            fill.style.backgroundColor = "#20b423";
        }
    } 
}  catch (error) {
    console.error("Error fetching profile data:", error); 
    }
}); 

const logoutButton = document.querySelector(".btn-logout");
if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {
        sessionStorage.removeItem("iduser");
    });
}