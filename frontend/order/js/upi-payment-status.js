const checkUpiPaymentStatus = async (
    orderId
) => {
    if (!orderId) {
        throw new Error(
            "Order ID is required."
        );
    }

    if (
        typeof window.getMyPayment !==
        "function"
    ) {
        throw new Error(
            "Payment API module is not loaded."
        );
    }

    const payment =
        await window.getMyPayment(
            orderId
        );

    const status =
        typeof window.getPaymentStatus ===
        "function"
            ? window.getPaymentStatus(
                payment
            )
            : (
                payment?.paymentStatus ||
                payment?.status ||
                "pending"
            );

    if (
        typeof window.setUpiPaymentPaid ===
        "function" &&
        status === "paid"
    ) {
        window.setUpiPaymentPaid(
            orderId,
            payment?._id ||
            payment?.paymentId ||
            null
        );
    }

    if (
        typeof window.setUpiPaymentFailed ===
        "function" &&
        status === "failed"
    ) {
        window.setUpiPaymentFailed(
            orderId,
            payment?._id ||
            payment?.paymentId ||
            null
        );
    }

    if (
        typeof window.setUpiPaymentCancelled ===
        "function" &&
        status === "cancelled"
    ) {
        window.setUpiPaymentCancelled(
            orderId,
            payment?._id ||
            payment?.paymentId ||
            null
        );
    }

    if (
        typeof window.setUpiPaymentPending ===
        "function" &&
        status === "pending"
    ) {
        window.setUpiPaymentPending(
            orderId,
            payment?._id ||
            payment?.paymentId ||
            null
        );
    }

    if (
        typeof window.renderPaymentStatus ===
        "function"
    ) {
        window.renderPaymentStatus(
            payment
        );
    }

    return payment;
};

window.checkUpiPaymentStatus =
    checkUpiPaymentStatus;
