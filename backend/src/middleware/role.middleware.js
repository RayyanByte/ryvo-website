const User = require("../models/user.model");


const authorizeRoles = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Authentication required."
                });
            }


            const user =
                await User.findById(
                    req.userId
                ).select(
                    "role isActive"
                );


            if (!user) {
                return res.status(401).json({
                    success: false,
                    message:
                        "User not found."
                });
            }


            if (!user.isActive) {
                return res.status(403).json({
                    success: false,
                    message:
                        "This account is inactive."
                });
            }


            if (
                !allowedRoles.includes(
                    user.role
                )
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You are not authorized to perform this action."
                });
            }


            req.userRole =
                user.role;


            next();

        } catch (error) {
            console.error(
                "Role authorization error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Something went wrong while checking authorization."
            });
        }
    };
};


module.exports = {
    authorizeRoles
};
