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
    const ready =
        isPaymentRuntimeReady();

    window.paymentRuntimeReady =
        ready;

    if (ready) {
        window.dispatchEvent(
            new CustomEvent(
                "paymentRuntimeReady"
            )
        );
    }

    return ready;
};

window.isPaymentRuntimeReady =
    isPaymentRuntimeReady;

window.initializePaymentRuntime =
    initializePaymentRuntime;

initializePaymentRuntime();
