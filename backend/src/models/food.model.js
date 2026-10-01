const mongoose = require("mongoose");


const foodSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        media: {
            images: [
                {
                    type: String,
                    trim: true
                }
            ],

            video: {
                type: String,
                trim: true,
                default: ""
            }
        },

        isAvailable: {
            type: Boolean,
            default: true
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);


const Food = mongoose.model(
    "Food",
    foodSchema
);


module.exports = Food;
