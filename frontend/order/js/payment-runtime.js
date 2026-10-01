const initializePaymentRuntime = () => {
    if (
        typeof window.getMyPayment !==
        "function"
    ) {
        return;
    }

    if (
        typeof window.getPaymentStatus !==
        "function"
    ) {
        return;
    }

    if (
        typeof window.checkUpiPaymentStatus !==
        "function"
    ) {
        return;
    }

    if (
        typeof window.startPaymentPolling !==
        "function"
    ) {
        return;
    }

    if (
        typeof window.handlePaymentResult !==
        "function"
    ) {
        return;
    }

    window.paymentRuntimeReady =
        true;

    window.dispatchEvent(
        new CustomEvent(
            "paymentRuntimeReady"
        )
    );
};

if (
    document.readyState ===
    "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        initializePaymentRuntime
    );
} else {
    initializePaymentRuntime();
}
