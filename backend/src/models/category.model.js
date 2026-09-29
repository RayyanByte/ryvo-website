const mongoose = require("mongoose");


const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 2,
            maxlength: 60
        },

        description: {
            type: String,
            trim: true,
            maxlength: 300,
            default: ""
        },

        image: {
            type: String,
            trim: true,
            default: ""
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


const Category = mongoose.model(
    "Category",
    categorySchema
);


module.exports = Category;
