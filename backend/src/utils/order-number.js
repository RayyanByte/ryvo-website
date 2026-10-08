const Order = require("../models/order.model");

// Confusing characters avoided: 0, O, 1, I, L
const ALLOWED_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const CODE_LENGTH = 5;
const MAX_ATTEMPTS = 10;


const generateCode = () => {
    let code = "";

    for (let i = 0; i < CODE_LENGTH; i++) {
        const randomIndex = Math.floor(
            Math.random() * ALLOWED_CHARS.length
        );

        code += ALLOWED_CHARS[randomIndex];
    }

    return code;
};


const generateUniqueOrderNumber = async () => {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const code = generateCode();

        const existing = await Order.findOne({
            orderNumber: code
        }).select("_id").lean();

        if (!existing) {
            return code;
        }
    }

    throw new Error(
        "Unable to generate unique order number. Please try again."
    );
};


module.exports = {
    generateUniqueOrderNumber
};
