const mongoose = require("mongoose");


const addressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        label: {
            type: String,
            enum: [
                "home",
                "work",
                "other"
            ],
            default: "home"
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 80
        },

        phone: {
            type: String,
            required: true,
            trim: true,
            minlength: 10,
            maxlength: 15
        },

        addressLine: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 200
        },

        landmark: {
            type: String,
            trim: true,
            maxlength: 100,
            default: ""
        },

        area: {
            type: String,
            trim: true,
            maxlength: 100,
            default: ""
        },

        city: {
            type: String,
            required: true,
            trim: true,
            maxlength: 60
        },

        state: {
            type: String,
            required: true,
            trim: true,
            maxlength: 60
        },

        pincode: {
            type: String,
            required: true,
            trim: true,
            minlength: 6,
            maxlength: 6
        },

        isDefault: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);


const Address = mongoose.model(
    "Address",
    addressSchema
);


module.exports = Address;
