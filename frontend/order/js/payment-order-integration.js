const initializePaymentOrderIntegration = () => {
    /*
     * Payment creation is handled by order-review.js.
     * UPI checkout is handled by payment-upi-flow.js.
     *
     * This file intentionally does not create another
     * payment record or open another Razorpay checkout.
     */
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
