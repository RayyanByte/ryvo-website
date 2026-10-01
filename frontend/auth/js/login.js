const loginForm = document.querySelector("#login-form");
const loginMessage = document.querySelector("#login-message");

const setLoginMessage = (message) => {
    if (!loginMessage) {
        return;
    }

    loginMessage.textContent = message;
};

const getDashboardPath = (role) => {
    if (role === "admin") {
        return "../../dashboards/admin/pages/dashboard.html";
    }

    if (role === "delivery") {
        return "../../delivery/pages/dashboard.html";
    }

    return "../../dashboards/customer/pages/dashboard.html";
};

const loginCustomer = async (email, password) => {
    const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Login failed."
        );
    }

    return result;
};

const handleLogin = async (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);

    const email = formData
        .get("email")
        .trim()
        .toLowerCase();

    const password = formData.get("password");

    if (!email || !password) {
        setLoginMessage(
            "Email and password are required."
        );

        return;
    }

    setLoginMessage("Signing in...");

    try {
        const result = await loginCustomer(
            email,
            password
        );

        const token =
            result?.data?.token;

        const role =
            result?.data?.user?.role;

        if (!token) {
            throw new Error(
                "Login succeeded but no authentication token was received."
            );
        }

        localStorage.setItem(
            "authToken",
            token
        );

        if (role) {
            localStorage.setItem(
                "userRole",
                role
            );
        }

        setLoginMessage(
            "Login successful."
        );

        window.location.href =
            getDashboardPath(role);

    } catch (error) {
        console.error(
            "Login error:",
            error
        );

        setLoginMessage(
            error.message ||
            "Unable to sign in."
        );
    }
};

if (loginForm) {
    loginForm.addEventListener(
        "submit",
        handleLogin
    );
}
