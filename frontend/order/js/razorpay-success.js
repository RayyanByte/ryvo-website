const handleRazorpaySuccess = async (
    orderId,
    response
) => {

    if (
        !orderId ||
        !response?.razorpay_order_id ||
        !response?.razorpay_payment_id ||
        !response?.razorpay_signature
    ) {
        throw new Error(
            "Invalid Razorpay payment response."
        );
    }

    if (
        typeof window.verifyUpiPayment !==
        "function"
    ) {
        throw new Error(
            "UPI verification service is unavailable."
        );
    }

    const result =
        await window.verifyUpiPayment({
            orderId,
            razorpayOrderId:
                response.razorpay_order_id,
            razorpayPaymentId:
                response.razorpay_payment_id,
            razorpaySignature:
                response.razorpay_signature
        });

    return result;
};


window.handleRazorpaySuccess =
    handleRazorpaySuccess;
