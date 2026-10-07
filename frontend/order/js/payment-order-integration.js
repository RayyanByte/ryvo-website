const initializePaymentOrderIntegration = () => {

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
                event.detail?.orderId;

            if (!orderId) {
                return;
            }

            const paymentMethod =
                order?.paymentMethod ||
                payment?.paymentMethod ||
                window.getSelectedPaymentMethod?.();

            if (!paymentMethod) {
                return;
            }

            try {

                if (
                    paymentMethod === "cod"
                ) {

                    const result =
                        await window.createPayment({
                            orderId,
                            paymentMethod:
                                "cod"
                        });

                    window.renderPaymentStatus?.(
                        result
                    );

                    window.dispatchEvent(
                        new CustomEvent(
                            "codPaymentCreated",
                            {
                                detail: {
                                    orderId,
                                    payment:
                                        result
                                }
                            }
                        )
                    );

                    return;
                }

                if (
                    paymentMethod === "upi"
                ) {

                    const result =
                        await window.createPayment({
                            orderId,
                            paymentMethod:
                                "upi"
                        });

                    const gateway =
                        result?.gateway ||
                        result?.data?.gateway;

                    if (!gateway) {
                        throw new Error(
                            "UPI gateway data is missing."
                        );
                    }

                    window.setUpiPaymentPending?.(
                        orderId,
                        result?.payment?._id ||
                        result?._id ||
                        null
                    );

                    const verified =
                        await window.openRazorpayCheckout({
                            orderId,
                            gateway
                        });

                    window.setUpiPaymentPaid?.(
                        orderId,
                        verified?.providerPaymentId ||
                        verified?.transactionId ||
                        null
                    );

                    window.dispatchEvent(
                        new CustomEvent(
                            "upiPaymentVerified",
                            {
                                detail: {
                                    orderId,
                                    payment:
                                        verified
                                }
                            }
                        )
                    );
                }

            } catch (error) {

                console.error(
                    "Payment order integration error:",
                    error
                );

                window.dispatchEvent(
                    new CustomEvent(
                        "paymentError",
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
        initializePaymentOrderIntegration
    );
} else {
    initializePaymentOrderIntegration();
}
