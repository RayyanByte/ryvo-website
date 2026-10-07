document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("admin-login-form");
    const emailInput = document.getElementById("admin-email");
    const passwordInput = document.getElementById("admin-password");
    const errorBox = document.getElementById("admin-login-error");
    const loginButton = document.getElementById("admin-login-button");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        errorBox.hidden = true;
        errorBox.textContent = "";
        loginButton.disabled = true;
        loginButton.textContent = "Logging in...";

        try {
            const response = await fetch("http://localhost:5000/api/auth/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    email: emailInput.value.trim(),
                    password: passwordInput.value
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Admin login failed.");
            }

            window.location.href = "/admin/";

        } catch (error) {
            errorBox.textContent = error.message;
            errorBox.hidden = false;
            loginButton.disabled = false;
            loginButton.textContent = "Login";
        }
    });
});
