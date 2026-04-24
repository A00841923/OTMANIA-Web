const game = document.getElementById("gameScreen");
const gameFrame = document.getElementById("game-frame");

if (sessionStorage.getItem("iduser")) {
        gameFrame.src = "OTMANIA_GAME/index.html?id=" + sessionStorage.getItem("iduser");
    }