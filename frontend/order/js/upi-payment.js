const UPI_PAYMENT_STATE_KEY =
    "ryvo_upi_payment_state";

let upiPaymentState = {
    status: "idle",
    orderId: null,
    paymentId: null
};

const SUPPORTED_UPI_STATES = [
    "idle",
    "pending",
    "paid",
    "failed"
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
            !SUPPORTED_UPI_STATES.includes(
                parsedState.status
            )
        ) {
            return;
        }

        upiPaymentState = {
            status:
                parsedState.status,
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

const renderUpiPaymentMessage = (
    message,
    type = ""
) => {
    const element =
        document.getElementById(
            "upi-payment-message"
        );

    if (!element) {
        return;
    }

    element.textContent = message;
    element.className =
        `upi-payment-message ${type}`.trim();
};

const setUpiPaymentState = (
    status,
    orderId = null,
    paymentId = null
) => {
    if (
        !SUPPORTED_UPI_STATES.includes(
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

    saveUpiPaymentState();

    return true;
};

const initializeUpiPayment = () => {
    loadUpiPaymentState();
};

window.getUpiPaymentState = () => {
    return {
        ...upiPaymentState
    };
};

window.setUpiPaymentPending = (
    orderId,
    paymentId
) => {
    setUpiPaymentState(
        "pending",
        orderId,
        paymentId
    );

    renderUpiPaymentMessage(
        "UPI payment is pending."
    );
};

window.setUpiPaymentPaid = (
    orderId,
    paymentId
) => {
    setUpiPaymentState(
        "paid",
        orderId,
        paymentId
    );

    renderUpiPaymentMessage(
        "UPI payment confirmed.",
        "success"
    );
};

window.setUpiPaymentFailed = (
    orderId,
    paymentId
) => {
    setUpiPaymentState(
        "failed",
        orderId,
        paymentId
    );

    renderUpiPaymentMessage(
        "UPI payment failed.",
        "error"
    );
};

window.clearUpiPaymentState = () => {
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

    renderUpiPaymentMessage("");
};

if (
    document.readyState ===
    "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        initializeUpiPayment
    );
} else {
    initializeUpiPayment();
}
