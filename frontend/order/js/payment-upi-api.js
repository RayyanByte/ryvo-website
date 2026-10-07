const UPI_PAYMENT_API_BASE_URL =
    "http://localhost:5000/api/payments";


const getAuthToken = () => {
    return localStorage.getItem(
        "authToken"
    );
};


const verifyUpiPayment = async ({
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
}) => {
    if (!orderId) {
        throw new Error(
            "Order ID is required."
        );
    }

    const token =
        getAuthToken();

    if (!token) {
        throw new Error(
            "Please login before verifying payment."
        );
    }

    const response =
        await fetch(
            `${UPI_PAYMENT_API_BASE_URL}/${encodeURIComponent(
                orderId
            )}/verify-upi`,
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
                        razorpayOrderId,
                        razorpayPaymentId,
                        razorpaySignature
                    })
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
            "Unable to verify UPI payment."
        );
    }

    return (
        result?.data ||
        result
    );
};


window.verifyUpiPayment =
    verifyUpiPayment;
