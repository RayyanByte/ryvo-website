const markUpiPaymentPaid = async (
    orderId,
    transactionId
) => {
    if (
        typeof window.updateUpiPaymentStatus !==
        "function"
    ) {
        throw new Error(
            "UPI payment API is not loaded."
        );
    }

    return window.updateUpiPaymentStatus(
        orderId,
        "paid",
        transactionId
    );
};

const markUpiPaymentFailed = async (
    orderId,
    transactionId = null
) => {
    if (
        typeof window.updateUpiPaymentStatus !==
        "function"
    ) {
        throw new Error(
            "UPI payment API is not loaded."
        );
    }

    return window.updateUpiPaymentStatus(
        orderId,
        "failed",
        transactionId
    );
};

const markUpiPaymentCancelled = async (
    orderId,
    transactionId = null
) => {
    if (
        typeof window.updateUpiPaymentStatus !==
        "function"
    ) {
        throw new Error(
            "UPI payment API is not loaded."
        );
    }

    return window.updateUpiPaymentStatus(
        orderId,
        "cancelled",
        transactionId
    );
};

window.markUpiPaymentPaid =
    markUpiPaymentPaid;

window.markUpiPaymentFailed =
    markUpiPaymentFailed;

window.markUpiPaymentCancelled =
    markUpiPaymentCancelled;
