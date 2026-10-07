const PAYMENT_API_BASE_URL =
    "/api/payments";


const getPaymentAuthToken = () => {
    return (
        localStorage.getItem("authToken") ||
        localStorage.getItem("token")
    );
};


const createPayment = async ({
    orderId,
    paymentMethod
}) => {

    const token =
        getPaymentAuthToken();

    if (!token) {
        throw new Error(
            "Please login before making payment."
        );
    }

    const response =
        await fetch(
            PAYMENT_API_BASE_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`
                },

                body:
                    JSON.stringify({
                        orderId,
                        paymentMethod
                    })
            }
        );

    const result =
        await response.json();

    if (!response.ok) {
        throw new Error(
            result?.message ||
            "Unable to create payment."
        );
    }

    return result?.data || result;
};


const getMyPayment = async (
    orderId
) => {

    const token =
        getPaymentAuthToken();

    if (!token) {
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
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

    const result =
        await response.json();

    if (!response.ok) {
        throw new Error(
            result?.message ||
            "Unable to fetch payment."
        );
    }

    return result?.data || result;
};


window.createPayment =
    createPayment;

window.getMyPayment =
    getMyPayment;
