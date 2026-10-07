const mongoose = require("mongoose");

const Payment = require("../../models/payment.model");
const Order = require("../../models/order.model");

const {
    createRazorpayOrder,
    verifyPaymentSignature
} = require("../../services/payment/razorpay.service");


const PAYMENT_METHODS = [
    "cod",
    "upi"
];


const createPayment = async (
    req,
    res
) => {
    try {
        const customerId =
            req.userId;

        const {
            orderId,
            paymentMethod
        } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(
                orderId
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID."
            });
        }

        if (
            !PAYMENT_METHODS.includes(
                paymentMethod
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid payment method."
            });
        }

        const order =
            await Order.findOne({
                _id: orderId,
                userId: customerId
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        if (
            order.paymentMethod !==
            paymentMethod
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Payment method does not match the order."
            });
        }

        if (
            order.status === "cancelled"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Cancelled orders cannot be paid."
            });
        }

        const existingPayment =
            await Payment.findOne({
                order: order._id
            });

        if (existingPayment) {
            return res.status(200).json({
                success: true,
                message:
                    "Payment record already exists.",
                data: existingPayment
            });
        }

        if (
            paymentMethod === "cod"
        ) {
            const payment =
                await Payment.create({
                    order: order._id,
                    customer: customerId,
                    paymentMethod: "cod",
                    paymentStatus: "pending",
                    amount: order.totalAmount,
                    currency: "INR",
                    provider: "none"
                });

            return res.status(201).json({
                success: true,
                message:
                    "COD payment created successfully.",
                data: payment
            });
        }

        const razorpayOrder =
            await createRazorpayOrder({
                orderId: order._id,
                amount: order.totalAmount
            });

        const payment =
            await Payment.create({
                order: order._id,
                customer: customerId,
                paymentMethod: "upi",
                paymentStatus: "pending",
                amount: order.totalAmount,
                currency: "INR",
                provider: "razorpay",
                providerOrderId:
                    razorpayOrder.id
            });

        return res.status(201).json({
            success: true,
            message:
                "UPI payment created successfully.",
            data: {
                payment,
                gateway: {
                    provider: "razorpay",
                    keyId:
                        process.env.RAZORPAY_KEY_ID,
                    orderId:
                        razorpayOrder.id,
                    amount:
                        razorpayOrder.amount,
                    currency:
                        razorpayOrder.currency
                }
            }
        });

    } catch (error) {
        console.error(
            "Create payment error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to create payment."
        });
    }
};


const getMyPayment = async (
    req,
    res
) => {
    try {
        const customerId =
            req.userId;

        const { orderId } =
            req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                orderId
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID."
            });
        }

        const payment =
            await Payment.findOne({
                order: orderId,
                customer: customerId
            })
                .populate(
                    "order",
                    "status totalAmount paymentMethod paymentStatus"
                )
                .select("-__v");

        if (!payment) {
            return res.status(404).json({
                success: false,
                message:
                    "Payment record not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: payment
        });

    } catch (error) {
        console.error(
            "Get payment error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch payment."
        });
    }
};


const verifyUpiPayment = async (
    req,
    res
) => {
    try {
        const customerId =
            req.userId;

        const { orderId } =
            req.params;

        const {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(
                orderId
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID."
            });
        }

        if (
            !razorpayOrderId ||
            !razorpayPaymentId ||
            !razorpaySignature
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Razorpay verification data is required."
            });
        }

        const payment =
            await Payment.findOne({
                order: orderId,
                customer: customerId
            });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message:
                    "Payment record not found."
            });
        }

        if (
            payment.paymentMethod !== "upi" ||
            payment.provider !== "razorpay"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "This payment is not a Razorpay UPI payment."
            });
        }

        if (
            payment.providerOrderId !==
            razorpayOrderId
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Razorpay order does not match."
            });
        }

        const valid =
            verifyPaymentSignature({
                orderId:
                    razorpayOrderId,
                paymentId:
                    razorpayPaymentId,
                signature:
                    razorpaySignature
            });

        if (!valid) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid Razorpay payment signature."
            });
        }

        payment.providerPaymentId =
            razorpayPaymentId;

        payment.transactionId =
            razorpayPaymentId;

        payment.paymentStatus =
            "paid";

        payment.paidAt =
            new Date();

        await payment.save();

        await Order.findOneAndUpdate(
            {
                _id: orderId,
                userId: customerId
            },
            {
                paymentStatus: "paid"
            }
        );

        return res.status(200).json({
            success: true,
            message:
                "UPI payment verified successfully.",
            data: payment
        });

    } catch (error) {
        console.error(
            "Verify UPI payment error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to verify UPI payment."
        });
    }
};


module.exports = {
    createPayment,
    getMyPayment,
    verifyUpiPayment,
    PAYMENT_METHODS
};
