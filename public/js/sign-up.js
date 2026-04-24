document.addEventListener("DOMContentLoaded", () => {

    const passwordInput = document.getElementById("password");
    const reqLength = document.getElementById("req-length");
    const reqUpper = document.getElementById("req-upper");
    const reqNumber = document.getElementById("req-number");
    const reqSpecial = document.getElementById("req-special");

    const form = document.getElementById("signupForm");
    const errorMessage = document.getElementById("errorMessage");

    const verificationSection = document.getElementById("verificationSection");
    const signupSection = document.getElementById("signupSection");
    const verificationCodeInput = document.getElementById("verificationCode");

    let currentEmail = "";

    // Hide verification section initially
    verificationSection.style.display = "none";

    // Password strength validation on input
    passwordInput.addEventListener("input", () => {
        const password = passwordInput.value;

        const minLength = password.length >= 8;
        const upper = /[A-Z]/.test(password);
        const number = /[0-9]/.test(password);
        const special = /[!@#$%^&*]/.test(password);

        reqLength.innerHTML = minLength ? "✔ At least 8 characters" : "✖ At least 8 characters";
        reqUpper.innerHTML = upper ? "✔ One uppercase letter" : "✖ One uppercase letter";
        reqNumber.innerHTML = number ? "✔ One number" : "✖ One number";
        reqSpecial.innerHTML = special ? "✔ One special character (!@#$%^&*)" : "✖ One special character (!@#$%^&*)";

        reqLength.style.color = minLength ? "green" : "red";
        reqUpper.style.color = upper ? "green" : "red";
        reqNumber.style.color = number ? "green" : "red";
        reqSpecial.style.color = special ? "green" : "red";
    });

    // Validate password strength
    function validatePassword(password) {
        const minLength = password.length >= 8;
        const upper = /[A-Z]/.test(password);
        const number = /[0-9]/.test(password);
        const special = /[!@#$%^&*]/.test(password);

        return minLength && upper && number && special;
    }

    // Submit sign-up form
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        errorMessage.textContent = "";

        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const country = document.getElementById("country").value.trim();
        const email = document.getElementById("email").value.trim();
        const nickname = document.getElementById("nickname").value.trim();
        const password = document.getElementById("password").value;

        // Front-end validation
        if (!firstName || !lastName || !country || !email || !nickname || !password) {
            errorMessage.textContent = "Please fill all fields";
            return;
        }

        if (!validatePassword(password)) {
            errorMessage.textContent = "Please complete all password requirements";
            return;
        }

        try {
            const userType = document.getElementById("userType").value;
            const res = await fetch("http://localhost:3000/send-code", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    password,
                    nickname,
                    country,
                    userType
                })
            });

            const data = await res.json();

            if (!res.ok) {
                errorMessage.textContent = data.message;

                // color dependiendo del error
                if (data.message.includes("Admin")) {
                    errorMessage.style.color = "orange";
                    document.getElementById("userType").value = "3"; // reset a external
                } else {
                    errorMessage.style.color = "#dc3545";
                }

                return;
            }
            
            // Save email for verification step
            currentEmail = email;

            signupSection.classList.add("d-none");
            verificationSection.classList.add("active");

            errorMessage.textContent = "";
            errorMessage.style.color = "#dc3545";

        } catch (err) {
            errorMessage.textContent = "Error connecting to server";
        }
    });

    // Verify button handler
    const verifyBtn = verificationSection.querySelector("button");

    verifyBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const otpInputs = document.querySelectorAll(".otp");

        let code = "";
        otpInputs.forEach(input => {
            code += input.value;
        });

        if (code.length !== 6) {
            errorMessage.textContent = "Enter full verification code";
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/verify-code", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: currentEmail,
                    code
                })
            });

            const data = await res.json();

            if (!res.ok) {
                errorMessage.textContent = data.message;
                return;
            }

            // Success
            errorMessage.style.color = "green";
            errorMessage.textContent = "Account created successfully!";

            // Redirect to login after short delay
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);

        } catch (err) {
            errorMessage.textContent = "Error verifying code";
        }
    });

    // OTP auto-navigation
    const otpInputs = document.querySelectorAll(".otp");

    otpInputs.forEach((input, index) => {

        // Write -> next
        input.addEventListener("input", (e) => {
            const value = e.target.value;

            input.value = value.replace(/[^0-9]/g, "").slice(0, 1);

            if (input.value && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });

        // Backspace -> previous
        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && !input.value && index > 0) {
                otpInputs[index - 1].focus();
            }
        });

        // Paste handling
        input.addEventListener("paste", (e) => {
            e.preventDefault();

            const paste = (e.clipboardData || window.clipboardData).getData("text");
            const digits = paste.replace(/\D/g, "").slice(0, otpInputs.length);

            otpInputs.forEach((input, i) => {
                input.value = digits[i] || "";
            });

            if (digits.length > 0) {
                otpInputs[Math.min(digits.length - 1, otpInputs.length - 1)].focus();
            }
        });
    });
});