const handlePaymentResult = (
    payment
) => {
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

    const orderId =
        payment?.orderId ||
        payment?.order?._id ||
        payment?.order?.id ||
        null;

    const paymentId =
        payment?._id ||
        payment?.paymentId ||
        null;

    if (
        typeof window.renderPaymentStatus ===
        "function"
    ) {
        window.renderPaymentStatus(
            payment
        );
    }

    if (status === "paid") {
        window.setUpiPaymentPaid?.(
            orderId,
            paymentId
        );

        return "paid";
    }

    if (status === "failed") {
        window.setUpiPaymentFailed?.(
            orderId,
            paymentId
        );

        return "failed";
    }

    if (status === "cancelled") {
        window.setUpiPaymentCancelled?.(
            orderId,
            paymentId
        );

        return "cancelled";
    }

    if (status === "pending") {
        window.setUpiPaymentPending?.(
            orderId,
            paymentId
        );
    }

    return "pending";
};

window.handlePaymentResult =
    handlePaymentResult;
