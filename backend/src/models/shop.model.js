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
