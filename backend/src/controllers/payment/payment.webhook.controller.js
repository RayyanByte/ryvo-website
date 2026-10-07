const Payment = require("../../models/payment.model");
const Order = require("../../models/order.model");

const {
    verifyWebhookSignature
} = require("../../services/payment/razorpay.service");


const handleRazorpayWebhook = async (
    req,
    res
) => {
    try {
        const signature =
            req.headers[
                "x-razorpay-signature"
            ];

        if (!signature) {
            return res.status(400).json({
                success: false,
                message:
                    "Razorpay webhook signature is required."
            });
        }

        const rawBody =
            req.body instanceof Buffer
                ? req.body.toString("utf8")
                : "";

        const isValid =
            verifyWebhookSignature(
                rawBody,
                signature
            );

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid Razorpay webhook signature."
            });
        }

        let event;

        try {
            event =
                JSON.parse(rawBody);
        } catch {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid webhook payload."
            });
        }

        const eventName =
            event?.event;

        const paymentEntity =
            event?.payload?.payment?.entity;

        if (!paymentEntity) {
            return res.status(200).json({
                success: true,
                message:
                    "Webhook received."
            });
        }

        const razorpayOrderId =
            paymentEntity.order_id;

        const razorpayPaymentId =
            paymentEntity.id;

        if (!razorpayOrderId) {
            return res.status(200).json({
                success: true,
                message:
                    "Webhook ignored."
            });
        }

        const payment =
            await Payment.findOne({
                provider: "razorpay",
                providerOrderId:
                    razorpayOrderId
            });

        if (!payment) {
            return res.status(200).json({
                success: true,
                message:
                    "Payment record not found."
            });
        }

        if (
            eventName ===
                "payment.captured" ||
            eventName ===
                "order.paid"
        ) {
            payment.paymentStatus =
                "paid";

            payment.providerPaymentId =
                razorpayPaymentId ||
                payment.providerPaymentId;

            payment.transactionId =
                razorpayPaymentId ||
                payment.transactionId;

            payment.paidAt =
                payment.paidAt ||
                new Date();

            await payment.save();

            await Order.findByIdAndUpdate(
                payment.order,
                {
                    paymentStatus: "paid"
                }
            );
        }

        if (
            eventName ===
                "payment.failed"
        ) {
            if (
                payment.paymentStatus !==
                "paid"
            ) {
                payment.paymentStatus =
                    "failed";

                payment.providerPaymentId =
                    razorpayPaymentId ||
                    payment.providerPaymentId;

                await payment.save();

                await Order.findByIdAndUpdate(
                    payment.order,
                    {
                        paymentStatus:
                            "failed"
                    }
                );
            }
        }

        if (
            eventName ===
                "payment.refunded"
        ) {
            payment.paymentStatus =
                "refunded";

            payment.providerPaymentId =
                razorpayPaymentId ||
                payment.providerPaymentId;

            await payment.save();
        }

        return res.status(200).json({
            success: true,
            message:
                "Razorpay webhook processed."
        });

    } catch (error) {
        console.error(
            "Razorpay webhook error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to process Razorpay webhook."
        });
    }
};


module.exports = {
    handleRazorpayWebhook
};
