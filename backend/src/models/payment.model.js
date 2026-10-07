const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            unique: true,
            index: true
        },

        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        paymentMethod: {
            type: String,
            enum: ["cod", "upi"],
            required: true
        },

        paymentStatus: {
            type: String,
            enum: [
                "pending",
                "paid",
                "failed",
                "cancelled",
                "refunded"
            ],
            default: "pending",
            index: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        currency: {
            type: String,
            default: "INR",
            uppercase: true,
            trim: true
        },

        provider: {
            type: String,
            enum: ["none", "razorpay"],
            default: "none"
        },

        providerOrderId: {
            type: String,
            trim: true,
            default: null,
            index: true
        },

        providerPaymentId: {
            type: String,
            trim: true,
            default: null,
            index: true
        },

        transactionId: {
            type: String,
            trim: true,
            default: null
        },

        paidAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Payment = mongoose.model(
    "Payment",
    paymentSchema
);

module.exports = Payment;
