const mongoose = require("mongoose");

const deliveryLocationSchema = new mongoose.Schema(
    {
        latitude: {
            type: Number,
            required: true,
            min: -90,
            max: 90
        },

        longitude: {
            type: Number,
            required: true,
            min: -180,
            max: 180
        },

        source: {
            type: String,
            enum: [
                "gps",
                "map",
                "search",
                "address"
            ],
            required: true
        },

        isApproximate: {
            type: Boolean,
            default: false
        },

        distanceKm: {
            type: Number,
            required: true,
            min: 0
        }
    },
    { _id: false }
);

const orderItemSchema = new mongoose.Schema(
    {
        foodId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Food",
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        total: {
            type: Number,
            required: true,
            min: 0
        }
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        addressId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
            required: true
        },

        deliveryLocation: {
            type: deliveryLocationSchema,
            required: true
        },

        deliveryBoyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true
        },

        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (items) =>
                    Array.isArray(items) && items.length > 0,
                message: "Order must contain at least one item."
            }
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0
        },

        deliveryFee: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "preparing",
                "out_for_delivery",
                "delivered",
                "cancelled"
            ],
            default: "pending",
            index: true
        },

        paymentMethod: {
            type: String,
            enum: ["cod", "upi"],
            required: true
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
