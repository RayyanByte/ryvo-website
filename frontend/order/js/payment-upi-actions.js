const handleRazorpaySuccess = async (
    orderId,
    response
) => {
    if (
        typeof window.verifyUpiPayment !==
        "function"
    ) {
        throw new Error(
            "UPI verification API is not loaded."
        );
    }

    return window.verifyUpiPayment({
        orderId,

        razorpayOrderId:
            response?.razorpay_order_id,

        razorpayPaymentId:
            response?.razorpay_payment_id,

        razorpaySignature:
            response?.razorpay_signature
    });
};


window.handleRazorpaySuccess =
    handleRazorpaySuccess;
