const PAYMENT_STATUS_LABELS = {
    pending: "Payment Pending",
    paid: "Payment Successful",
    failed: "Payment Failed",
    cancelled: "Payment Cancelled",
    refunded: "Payment Refunded"
};

const getPaymentStatus = (
    payment
) => {
    const status =
        payment?.paymentStatus ||
        payment?.status ||
        "pending";

    return Object.prototype.hasOwnProperty.call(
        PAYMENT_STATUS_LABELS,
        status
    )
        ? status
        : "pending";
};

const renderPaymentStatus = (
    payment,
    elementId = "payment-status"
) => {
    const element =
        document.getElementById(
            elementId
        );

    if (!element) {
        return;
    }

    const status =
        getPaymentStatus(payment);

    element.textContent =
        PAYMENT_STATUS_LABELS[status];

    element.dataset.paymentStatus =
        status;
};

window.renderPaymentStatus =
    renderPaymentStatus;

window.getPaymentStatus =
    getPaymentStatus;
