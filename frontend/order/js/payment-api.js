const PAYMENT_API_BASE_URL =
    "http://localhost:5000/api/payments";

const getPaymentAuthHeaders = () => {
    const token =
        localStorage.getItem("authToken");

    if (!token) {
        return null;
    }

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };
};

const getMyPayment = async (orderId) => {
    if (!orderId) {
        throw new Error(
            "Order ID is required."
        );
    }

    const headers =
        getPaymentAuthHeaders();

    if (!headers) {
        throw new Error(
            "Please login before checking payment."
        );
    }

    const response =
        await fetch(
            `${PAYMENT_API_BASE_URL}/${encodeURIComponent(
                orderId
            )}`,
            {
                method: "GET",
                headers
            }
        );

    let result = null;

    try {
        result =
            await response.json();
    } catch {
        result = null;
    }

    if (!response.ok) {
        throw new Error(
            result?.message ||
            "Unable to load payment details."
        );
    }

    return (
        result?.data ||
        result?.payment ||
        result
    );
};

window.getMyPayment =
    getMyPayment;
