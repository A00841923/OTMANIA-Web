document.addEventListener("DOMContentLoaded", () => {

    const btnLogin = document.getElementById("btnLogin");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const errorMessage = document.getElementById("errorMessage");

    const form = document.querySelector("form");

    form.addEventListener("submit", function(e){
        e.preventDefault();
        console.log("Submit button clicked");
        validarLogin();
    });

    async function validarLogin(){

        // Validate input fields
        if(email.value.trim() === "" && password.value.trim() === ""){
            errorMessage.textContent = "Please enter your email and password";
            return;
        }

        if(email.value.trim() === ""){
            errorMessage.textContent = "Email cannot be empty";
            return;
        }

        if(password.value.trim() === ""){
            errorMessage.textContent = "Password cannot be empty";
            return;
        }

        const credentials = {
            Email: email.value,
            Password: password.value
        };

        const res = await fetch("http://localhost:3000/login", {
            method:"POST", 
            headers:{"Content-Type":"application/json"}, 
            body:JSON.stringify(credentials)
        });

        const data = await res.json();
        console.log(data);

        // Data validation handling
        if(res.status === 401){
            errorMessage.textContent = "Email or password is incorrect";
            return;
        }

        // Server error handling
        if(!res.ok){
            errorMessage.textContent = "Login failed. Please try again";
            return;
        }

        // Login success handling
        if (data.isLogin === true){
            console.log("USER:", data.user);

            const id = data.user.iduser;
            const type = data.user.idusertype;
            const company = data.user.idcompany;

            if (!id) {
                console.error("id user not found:", data.user);
                window.location = "./index.html";
                return;
            }

            sessionStorage.setItem("iduser", id);
            sessionStorage.setItem("userType", type);
            sessionStorage.setItem("companyId", company);

            window.location = "./home.html";
        }
    }
});