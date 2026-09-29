const mongoose = require("mongoose");

const Payment = require("../../models/payment.model");
const Order = require("../../models/order.model");


const createPayment = async (req, res) => {
    try {
        const userId = req.userId;

        const {
            orderId,
            paymentMethod
        } = req.body;


        if (!orderId || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message:
                    "Order ID and payment method are required."
            });
        }


        if (
            !mongoose.Types.ObjectId.isValid(
                orderId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid order ID."
            });
        }


        if (
            !["cod", "upi"].includes(
                paymentMethod
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid payment method."
            });
        }


        const order = await Order.findById(
            orderId
        );


        if (!order) {
            return res.status(404).json({
                success: false,
                message:
                    "Order not found."
            });
        }


        if (
            !order.userId ||
            order.userId.toString() !==
                userId.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not allowed to access this order."
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


        const amount =
            Number(order.totalAmount);


        if (
            !Number.isFinite(amount) ||
            amount < 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Order amount is invalid."
            });
        }


        const payment =
            await Payment.create({
                order: order._id,
                customer: userId,
                paymentMethod:
                    order.paymentMethod,
                paymentStatus: "pending",
                amount
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
                "Unable to create payment record."
        });
    }
};


const getMyPayment = async (req, res) => {
    try {
        const userId = req.userId;
        const { orderId } = req.params;


        if (
            !mongoose.Types.ObjectId.isValid(
                orderId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid order ID."
            });
        }


        const payment =
            await Payment.findOne({
                order: orderId,
                customer: userId
            }).populate(
                "order"
            );


        if (!payment) {
            return res.status(404).json({
                success: false,
                message:
                    "Payment not found."
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
                "Unable to get payment."
        });
    }
};


module.exports = {
    createPayment,
    getMyPayment
};
