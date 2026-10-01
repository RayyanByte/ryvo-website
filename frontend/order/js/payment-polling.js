const PAYMENT_POLL_INTERVAL = 5000;

let paymentPollingTimer = null;

const stopPaymentPolling = () => {
    if (paymentPollingTimer) {
        clearInterval(
            paymentPollingTimer
        );

        paymentPollingTimer = null;
    }
};

const startPaymentPolling = (
    orderId
) => {
    if (!orderId) {
        return;
    }

    stopPaymentPolling();

    const checkStatus = async () => {
        try {
            if (
                typeof window.checkUpiPaymentStatus !==
                "function"
            ) {
                return;
            }

            const payment =
                await window.checkUpiPaymentStatus(
                    orderId
                );

            const status =
                typeof window.getPaymentStatus ===
                "function"
                    ? window.getPaymentStatus(
                        payment
                    )
                    : (
                        payment?.paymentStatus ||
                        payment?.status ||
                        "pending"
                    );

            if (
                status === "paid" ||
                status === "failed" ||
                status === "cancelled"
            ) {
                stopPaymentPolling();
            }
        } catch (error) {
            console.error(
                "Payment polling error:",
                error
            );
        }
    };

    checkStatus();

    paymentPollingTimer =
        setInterval(
            checkStatus,
            PAYMENT_POLL_INTERVAL
        );
};

window.startPaymentPolling =
    startPaymentPolling;

window.stopPaymentPolling =
    stopPaymentPolling;
