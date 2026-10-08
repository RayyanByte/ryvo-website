const mongoose = require("mongoose");


const shopSchema = new mongoose.Schema(
    {
        isOpen: {
            type: Boolean,
            default: true
        },

        statusMessage: {
            type: String,
            trim: true,
            maxlength: 200,
            default: "Shop is open."
        },

        location: {
            latitude: {
                type: Number,
                min: -90,
                max: 90,
                default: 0
            },

            longitude: {
                type: Number,
                min: -180,
                max: 180,
                default: 0
            }
        },

        deliveryRadiusKm: {
            type: Number,
            min: 0.1,
            max: 100,
            default: 2
        },

        deliveryTimeRanges: {
            type: [
                {
                    _id: false,
                    minKm: {
                        type: Number,
                        required: true,
                        min: 0
                    },
                    maxKm: {
                        type: Number,
                        required: true,
                        min: 0
                    },
                    minMinutes: {
                        type: Number,
                        required: true,
                        min: 1
                    },
                    maxMinutes: {
                        type: Number,
                        required: true,
                        min: 1
                    }
                }
            ],
            default: [
                { minKm: 0, maxKm: 2, minMinutes: 20, maxMinutes: 25 },
                { minKm: 2, maxKm: 5, minMinutes: 25, maxMinutes: 35 },
                { minKm: 5, maxKm: 10, minMinutes: 35, maxMinutes: 50 },
                { minKm: 10, maxKm: 15, minMinutes: 50, maxMinutes: 70 }
            ]
        }
    },
    {
        timestamps: true
    }
);


const Shop = mongoose.model(
    "Shop",
    shopSchema
);


module.exports = Shop;
