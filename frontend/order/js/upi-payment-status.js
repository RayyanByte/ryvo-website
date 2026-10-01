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

    const paymentId =
        payment?._id ||
        payment?.paymentId ||
        null;

    if (status === "paid") {
        window.setUpiPaymentPaid?.(
            orderId,
            paymentId
        );
    }

    if (status === "failed") {
        window.setUpiPaymentFailed?.(
            orderId,
            paymentId
        );
    }

    if (status === "cancelled") {
        window.setUpiPaymentCancelled?.(
            orderId,
            paymentId
        );
    }

    if (status === "pending") {
        window.setUpiPaymentPending?.(
            orderId,
            paymentId
        );
    }

    if (
        typeof window.handlePaymentResult ===
        "function"
    ) {
        window.handlePaymentResult(
            payment
        );
    } else if (
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
