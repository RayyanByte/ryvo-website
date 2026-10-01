const handlePaymentResult = (
    payment
) => {
    const status =
        typeof window.getPaymentStatus ===
        "function"
            ? window.getPaymentStatus(payment)
            : (
                payment?.paymentStatus ||
                payment?.status ||
                "pending"
            );

    if (
        typeof window.renderPaymentStatus ===
        "function"
    ) {
        window.renderPaymentStatus(
            payment
        );
    }

    if (status === "paid") {
        if (
            typeof window.setUpiPaymentPaid ===
            "function"
        ) {
            window.setUpiPaymentPaid(
                payment?.orderId ||
                payment?.order?._id ||
                null,
                payment?._id ||
                payment?.paymentId ||
                null
            );
        }

        return "paid";
    }

    if (status === "failed") {
        if (
            typeof window.setUpiPaymentFailed ===
            "function"
        ) {
            window.setUpiPaymentFailed(
                payment?.orderId ||
                payment?.order?._id ||
                null,
                payment?._id ||
                payment?.paymentId ||
                null
            );
        }

        return "failed";
    }

    if (status === "cancelled") {
        if (
            typeof window.setUpiPaymentCancelled ===
            "function"
        ) {
            window.setUpiPaymentCancelled(
                payment?.orderId ||
                payment?.order?._id ||
                null,
                payment?._id ||
                payment?.paymentId ||
                null
            );
        }

        return "cancelled";
    }

    return "pending";
};

window.handlePaymentResult =
    handlePaymentResult;
