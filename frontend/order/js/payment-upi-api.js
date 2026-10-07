const UPI_PAYMENT_API_BASE_URL =
    "http://localhost:5000/api/payments";

const updateUpiPaymentStatus = async (
    orderId,
    paymentStatus,
    transactionId = null
) => {
    if (!orderId) {
        throw new Error(
            "Order ID is required."
        );
    }

    const token =
        localStorage.getItem(
            "authToken"
        );

    if (!token) {
        throw new Error(
            "Please login before updating payment."
        );
    }

    if (
        ![
            "paid",
            "failed",
            "cancelled"
        ].includes(paymentStatus)
    ) {
        throw new Error(
            "Invalid payment status."
        );
    }

    const response =
        await fetch(
            `${UPI_PAYMENT_API_BASE_URL}/${encodeURIComponent(
                orderId
            )}/status`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`
                },

                body:
                    JSON.stringify({
                        paymentStatus,
                        transactionId
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
            "Unable to update UPI payment status."
        );
    }

    return (
        result?.data ||
        result?.payment ||
        result
    );
};

window.updateUpiPaymentStatus =
    updateUpiPaymentStatus;
