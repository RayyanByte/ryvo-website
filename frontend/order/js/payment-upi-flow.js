const initializeUpiPaymentFlow = () => {
    const getOrderId = (event) => {
        const order =
            event.detail?.order;

        return (
            order?._id ||
            order?.id ||
            event.detail?.orderId ||
            null
        );
    };

    window.addEventListener(
        "orderCreated",
        async (event) => {
            const order =
                event.detail?.order;

            const payment =
                event.detail?.payment;

            const paymentMethod =
                order?.paymentMethod ||
                payment?.paymentMethod ||
                window.getSelectedPaymentMethod?.();

            if (
                paymentMethod !== "upi"
            ) {
                return;
            }

            const orderId =
                getOrderId(event);

            if (!orderId) {
                return;
            }

            if (
                typeof window.renderPaymentStatus ===
                "function"
            ) {
                window.renderPaymentStatus(
                    payment
                );
            }

            window.dispatchEvent(
                new CustomEvent(
                    "upiPaymentReady",
                    {
                        detail: {
                            orderId,
                            payment
                        }
                    }
                )
            );
        }
    );
};

if (
    document.readyState ===
    "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        initializeUpiPaymentFlow
    );
} else {
    initializeUpiPaymentFlow();
}
