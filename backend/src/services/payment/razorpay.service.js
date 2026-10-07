const crypto = require("crypto");
const Razorpay = require("razorpay");

const razorpayKeyId =
    process.env.RAZORPAY_KEY_ID;

const razorpayKeySecret =
    process.env.RAZORPAY_KEY_SECRET;

const razorpayWebhookSecret =
    process.env.RAZORPAY_WEBHOOK_SECRET;

const razorpay =
    razorpayKeyId &&
    razorpayKeySecret
        ? new Razorpay({
            key_id: razorpayKeyId,
            key_secret: razorpayKeySecret
        })
        : null;


const assertRazorpayConfigured = () => {
    if (!razorpay) {
        throw new Error(
            "Razorpay is not configured."
        );
    }
};


const createRazorpayOrder = async ({
    orderId,
    amount
}) => {
    assertRazorpayConfigured();

    const amountInPaise =
        Math.round(
            Number(amount) * 100
        );

    if (
        !Number.isInteger(amountInPaise) ||
        amountInPaise <= 0
    ) {
        throw new Error(
            "Invalid payment amount."
        );
    }

    return razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: String(orderId),
        notes: {
            ryvoOrderId:
                String(orderId)
        }
    });
};


const verifyPaymentSignature = ({
    orderId,
    paymentId,
    signature
}) => {
    if (
        !orderId ||
        !paymentId ||
        !signature ||
        !razorpayKeySecret
    ) {
        return false;
    }

    const generatedSignature =
        crypto
            .createHmac(
                "sha256",
                razorpayKeySecret
            )
            .update(
                `${orderId}|${paymentId}`
            )
            .digest("hex");

    return crypto.timingSafeEqual(
        Buffer.from(
            generatedSignature
        ),
        Buffer.from(signature)
    );
};


const verifyWebhookSignature = (
    rawBody,
    signature
) => {
    if (
        !rawBody ||
        !signature ||
        !razorpayWebhookSecret
    ) {
        return false;
    }

    const generatedSignature =
        crypto
            .createHmac(
                "sha256",
                razorpayWebhookSecret
            )
            .update(rawBody)
            .digest("hex");

    return crypto.timingSafeEqual(
        Buffer.from(
            generatedSignature
        ),
        Buffer.from(signature)
    );
};


module.exports = {
    createRazorpayOrder,
    verifyPaymentSignature,
    verifyWebhookSignature
};
