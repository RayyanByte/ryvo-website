const PAYMENT_RUNTIME_SCRIPTS = [
    "payment-api.js",
    "payment-status.js",
    "upi-payment.js",
    "upi-payment-status.js",
    "payment-result.js",
    "payment-polling.js",
    "payment-flow.js"
];

const isPaymentRuntimeReady = () => {
    return (
        typeof window.getMyPayment ===
            "function" &&
        typeof window.getPaymentStatus ===
            "function" &&
        typeof window.checkUpiPaymentStatus ===
            "function" &&
        typeof window.startPaymentPolling ===
            "function" &&
        typeof window.handlePaymentResult ===
            "function"
    );
};

const initializePaymentRuntime = () => {
    if (
        isPaymentRuntimeReady()
    ) {
        window.paymentRuntimeReady =
            true;

        window.dispatchEvent(
            new CustomEvent(
                "paymentRuntimeReady"
            )
        );
    }
};

window.isPaymentRuntimeReady =
    isPaymentRuntimeReady;

window.initializePaymentRuntime =
    initializePaymentRuntime;

initializePaymentRuntime();
