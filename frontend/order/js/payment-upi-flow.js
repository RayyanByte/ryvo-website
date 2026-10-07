const initializeUpiPaymentFlow = () => {
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
                order?._id ||
                order?.id ||
                event.detail?.orderId ||
                null;

            if (!orderId) {
                return;
            }

            const gateway =
                payment?.gateway;

            if (
                !gateway ||
                gateway.provider !==
                    "razorpay"
            ) {
                return;
            }

            window.setUpiPaymentPending?.(
                orderId,
                payment?.payment?._id ||
                payment?._id ||
                null
            );

            window.renderPaymentStatus?.(
                payment
            );

            try {
                const result =
                    await window.openRazorpayCheckout({
                        orderId,
                        gateway
                    });

                window.setUpiPaymentPaid?.(
                    orderId,
                    result?.providerPaymentId ||
                    result?.transactionId ||
                    null
                );

                window.dispatchEvent(
                    new CustomEvent(
                        "upiPaymentVerified",
                        {
                            detail: {
                                orderId,
                                payment:
                                    result
                            }
                        }
                    )
                );

            } catch (error) {
                console.error(
                    "UPI checkout error:",
                    error
                );

                window.setUpiPaymentFailed?.(
                    orderId
                );

                window.dispatchEvent(
                    new CustomEvent(
                        "upiPaymentFailed",
                        {
                            detail: {
                                orderId,
                                error
                            }
                        }
                    )
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
        initializeUpiPaymentFlow
    );
} else {
    initializeUpiPaymentFlow();
}
