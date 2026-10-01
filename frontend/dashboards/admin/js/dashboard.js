const SHOP_API_URL =
    "http://localhost:5000/api/shop";

const DELIVERY_BOYS_API_URL =
    "http://localhost:5000/api/auth/admin/delivery-boys";

const ORDERS_API_URL =
    "http://localhost:5000/api/orders/admin";

const ORDER_API_URL =
    "http://localhost:5000/api/orders";


const getAuthToken = () => {
    return localStorage.getItem("authToken");
};


const getAuthHeaders = () => {
    return {
        Authorization:
            `Bearer ${getAuthToken()}`
    };
};


const setMessage = (
    elementId,
    message
) => {
    const element =
        document.getElementById(
            elementId
        );

    if (element) {
        element.textContent = message;
    }
};


const escapeHtml = (value) => {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
};


const initializeAdminDashboard = () => {
    if (!getAuthToken()) {
        setMessage(
            "shop-message",
            "Please sign in as admin."
        );

        setMessage(
            "delivery-boy-message",
            "Please sign in as admin."
        );

        return;
    }

    initializeShopSettings();
    initializeDeliveryBoys();
    initializeOrderManagement();
};


initializeAdminDashboard();
