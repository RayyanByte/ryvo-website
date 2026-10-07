const jwt = require("jsonwebtoken");


const generateAdminToken = (userId) => {
    return jwt.sign(
        {
            userId
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "2h"
        }
    );
};

const generateToken = (userId) => {
    return jwt.sign(
        {
            userId
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};


module.exports = {
    generateToken,
    generateAdminToken
};
