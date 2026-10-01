const mongoose = require("mongoose");

const Payment = require("../../models/payment.model");
const Order = require("../../models/order.model");

const PAYMENT_METHODS = ["cod", "upi"];

const createPayment = async (req, res) => {
    try {
        const customerId = req.userId;
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

        const order = await Order.findOne({
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

        const payment =
            await Payment.create({
                order: order._id,
                customer: customerId,
                paymentMethod,
                paymentStatus:
                    "pending",
                amount:
                    order.totalAmount
            });

        return res.status(201).json({
            success: true,
            message:
                "Payment record created successfully.",
            data: payment
        });
    } catch (error) {
        console.error(
            "Create payment error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to create payment."
        });
    }
};

const getMyPayment = async (req, res) => {
    try {
        const customerId = req.userId;
        const { orderId } = req.params;

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

module.exports = {
    createPayment,
    getMyPayment,
    PAYMENT_METHODS
};
