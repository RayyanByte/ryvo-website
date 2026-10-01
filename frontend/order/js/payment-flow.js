const initializePaymentFlow = () => {
    window.addEventListener(
        "orderCreated",
        async (event) => {
            const order =
                event.detail?.order;

            const payment =
                event.detail?.payment;

            const orderId =
                order?._id ||
                order?.id ||
                null;

            if (!orderId) {
                return;
            }

            const paymentMethod =
                order?.paymentMethod ||
                payment?.paymentMethod ||
                window.getSelectedPaymentMethod?.();

            if (
                paymentMethod !== "upi"
            ) {
                return;
            }

            if (
                typeof window.setUpiPaymentPending ===
                "function"
            ) {
                window.setUpiPaymentPending(
                    orderId,
                    payment?._id ||
                    payment?.paymentId ||
                    null
                );
            }

            if (
                typeof window.startPaymentPolling ===
                "function"
            ) {
                window.startPaymentPolling(
                    orderId
                );
            }
        }
    );
};

if (
    document.readyState ===
    "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        initializePaymentFlow
    );
} else {
    initializePaymentFlow();
}
