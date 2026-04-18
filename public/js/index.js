const email = document.getElementById("email");
const password = document.getElementById("password");
const btnLogin = document.getElementById("btnLogin");
const error = document.getElementById("errorMessage");

btnLogin.addEventListener("click", verificarDatosCuenta);

async function verificarDatosCuenta(e){
    e.preventDefault();

    if (!email.value || !password.value) {
        error.textContent = "Por favor ingresa correo y contraseña";
        return;
    }

    try{
        const response = await fetch('http://localhost:6000/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({Email: email.value, Password: password.value})
        });
        
        const data = await response.json();
        console.log(email.value);
        console.log(password.value);
        console.log(data);

        if(data.isLogin === true){
            error.textContent = '¡Inicio de sesión exitoso! Bienvenido.';
            localStorage.setItem("userId", data.user.IDUser);
            window.location.href = './home.html';
        } else{
            error.textContent = "Correo o contraseña incorrectos";
        }
    } catch(error){ alert("Error de conexión con el servidor. Inténtalo más tarde."); }
}
