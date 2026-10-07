const jwt = require("jsonwebtoken");

const adminProtect = async (req, res, next) => {
    try {
        const token =
            req.cookies &&
            req.cookies.ryvo_admin_session;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Admin authentication required."
            });
        }

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        req.userId =
            decoded.userId;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired admin session."
        });
    }
};

module.exports = {
    adminProtect
};
