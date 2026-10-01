const renderPaymentStatus = (
    payment,
    elementId = "payment-status"
) => {
    const element =
        document.getElementById(elementId);

    if (!element) {
        return;
    }

    const status =
        payment?.paymentStatus ||
        payment?.status ||
        "pending";

    const statusLabels = {
        pending: "Payment Pending",
        paid: "Payment Successful",
        failed: "Payment Failed",
        cancelled: "Payment Cancelled",
        refunded: "Payment Refunded"
    };

    element.textContent =
        statusLabels[status] ||
        "Payment Pending";

    element.dataset.paymentStatus =
        status;
};

const getPaymentStatus = (
    payment
) => {
    return (
        payment?.paymentStatus ||
        payment?.status ||
        "pending"
    );
};

window.renderPaymentStatus =
    renderPaymentStatus;

window.getPaymentStatus =
    getPaymentStatus;
