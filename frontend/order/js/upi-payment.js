const UPI_PAYMENT_STATE_KEY =
    "ryvo_upi_payment_state";

let upiPaymentState = {
    status: "idle",
    orderId: null,
    paymentId: null
};

const UPI_PAYMENT_STATUSES = [
    "idle",
    "pending",
    "paid",
    "failed",
    "cancelled"
];

const saveUpiPaymentState = () => {
    try {
        sessionStorage.setItem(
            UPI_PAYMENT_STATE_KEY,
            JSON.stringify(upiPaymentState)
        );

        return true;
    } catch (error) {
        console.error(
            "UPI payment state storage error:",
            error
        );

        return false;
    }
};

const loadUpiPaymentState = () => {
    try {
        const storedState =
            sessionStorage.getItem(
                UPI_PAYMENT_STATE_KEY
            );

        if (!storedState) {
            return;
        }

        const parsedState =
            JSON.parse(storedState);

        if (
            !parsedState ||
            !UPI_PAYMENT_STATUSES.includes(
                parsedState.status
            )
        ) {
            return;
        }

        upiPaymentState = {
            status: parsedState.status,
            orderId:
                parsedState.orderId || null,
            paymentId:
                parsedState.paymentId || null
        };
    } catch (error) {
        console.error(
            "UPI payment state read error:",
            error
        );
    }
};

const setUpiPaymentState = (
    status,
    orderId = null,
    paymentId = null
) => {
    if (
        !UPI_PAYMENT_STATUSES.includes(
            status
        )
    ) {
        return false;
    }

    upiPaymentState = {
        status,
        orderId,
        paymentId
    };

    return saveUpiPaymentState();
};

const getUpiPaymentState = () => {
    return {
        ...upiPaymentState
    };
};

const clearUpiPaymentState = () => {
    upiPaymentState = {
        status: "idle",
        orderId: null,
        paymentId: null
    };

    try {
        sessionStorage.removeItem(
            UPI_PAYMENT_STATE_KEY
        );
    } catch (error) {
        console.error(
            "UPI payment state clear error:",
            error
        );
    }
};

window.getUpiPaymentState =
    getUpiPaymentState;

window.setUpiPaymentPending = (
    orderId,
    paymentId
) => {
    return setUpiPaymentState(
        "pending",
        orderId,
        paymentId
    );
};

window.setUpiPaymentPaid = (
    orderId,
    paymentId
) => {
    return setUpiPaymentState(
        "paid",
        orderId,
        paymentId
    );
};

window.setUpiPaymentFailed = (
    orderId,
    paymentId
) => {
    return setUpiPaymentState(
        "failed",
        orderId,
        paymentId
    );
};

window.setUpiPaymentCancelled = (
    orderId,
    paymentId
) => {
    return setUpiPaymentState(
        "cancelled",
        orderId,
        paymentId
    );
};

window.clearUpiPaymentState =
    clearUpiPaymentState;

loadUpiPaymentState();
