document.addEventListener("DOMContentLoaded", () => {

    const newPasswordInput = document.getElementById("newPassword");
    const reqLength = document.getElementById("req-length");
    const reqUpper = document.getElementById("req-upper");
    const reqNumber = document.getElementById("req-number");
    const reqSpecial = document.getElementById("req-special");

    const form = document.getElementById("resetForm");
    const errorEmail = document.getElementById("emailError");
    const errorOTP = document.getElementById("codeError");
    const errorPassword = document.getElementById("passwordError");

    const verificationSection = document.getElementById("step1");
    const otpSection = document.getElementById("step2");
    const changePasswordSection = document.getElementById("step3");
    const otpInputs = document.querySelectorAll(".otp");
    const sendCodeBtn = document.getElementById("sendCodeBtn");

    let userEmail = "";
    otpSection.style.display = "none";
    changePasswordSection.style.display = "none";

    // Password strength validation on input
    newPasswordInput.addEventListener("input", () => {
        const password = newPasswordInput.value;

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

        errorPassword.textContent = "";
    });

    // Validate password strength
    function validatePassword(password) {
        const minLength = password.length >= 8;
        const upper = /[A-Z]/.test(password);
        const number = /[0-9]/.test(password);
        const special = /[!@#$%^&*]/.test(password);

        return minLength && upper && number && special;
    }

    // Submit email for OTP
    sendCodeBtn.addEventListener("click", async () => {

        errorEmail.textContent = "";
        errorEmail.style.color = "red";
        const email = document.getElementById("email").value.trim();
        userEmail = email.toLowerCase();

        if (!email) {
            errorEmail.textContent = "Please enter your email.";
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/request-reset", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                errorEmail.style.color = "red";
                errorEmail.textContent = data.message;
                return;
            }

            errorEmail.style.color = "green";
            errorEmail.textContent = "Code sent! Check your email";

            // Move to OTP step after short delay
            setTimeout(() => {
                verificationSection.style.display = "none";
                otpSection.style.display = "block";
                otpInputs.forEach(input => input.value = "");
            }, 1500);

        } catch (err) {
            errorEmail.textContent = "Network error.";
        }
    });

    const verifyBtn = document.getElementById("verifyBtn");

    verifyBtn.addEventListener("click", async () => {
        errorOTP.textContent = "";
        errorOTP.style.color = "red";

        const email = userEmail;
        const code = Array.from(otpInputs).map(input => input.value).join("");

        if (code.length !== 6) {
            errorOTP.textContent = "Enter complete code";
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/verify-code", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, code })
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.message === "Code expired") {
                    errorOTP.style.color = "orange";
                    errorOTP.textContent = "Code expired. Please request a new one.";
                    
                    // Go back to email step after 2 seconds
                    setTimeout(() => {
                        otpSection.style.display = "none";
                        verificationSection.style.display = "block";
                    }, 2000);

                } else {
                    errorOTP.style.color = "red";
                    errorOTP.textContent = data.message || "Invalid code";
                }
                return;
            }

            // Move to change password step
            otpSection.style.display = "none";
            changePasswordSection.style.display = "block";

        } catch (err) {
            errorOTP.textContent = "Network error.";
        }
    });

    const resetBtn = document.getElementById("resetBtn");

    resetBtn.addEventListener("click", async () => {
        errorPassword.textContent = "";
        errorPassword.style.color = "red";

        const email = userEmail;
        const newPassword = newPasswordInput.value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (!confirmPassword) {
            errorPassword.textContent = "Please confirm your password.";
            return;
        }

        if (newPassword !== confirmPassword) {
            errorPassword.textContent = "Passwords do not match.";
            return;
        }

        if (!validatePassword(newPassword)) {
            errorPassword.textContent = "Password does not meet requirements.";
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, newPassword })
            });

            const data = await res.json();

            if (!res.ok) {
                errorPassword.textContent = data.message || "Error updating password";
                return;
            }

            errorPassword.style.color = "green";
            errorPassword.textContent = "Password updated successfully! Redirecting...";

            // Delay before redirecting to login page
            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);

        } catch (err) {
            errorPassword.textContent = "Network error.";
        }
    });


// OTP auto-navigation
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