const express = require("express");
const rateLimit = require("express-rate-limit");

const {
    registerUser,
    loginUser,
    loginAdmin,
    logoutAdmin,
    getAdminSession,
    getMyProfile,
    updateMyProfile,
    createDeliveryBoy,
    getDeliveryBoys
} = require("../controllers/auth/auth.controller");

const {
    protect
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

const {
    adminProtect
} = require("../middleware/admin-auth.middleware");

const adminLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many admin login attempts. Please try again later."
    }
});

const router = express.Router();

router.post(
    "/admin/login",
    adminLoginLimiter,
    loginAdmin
);

router.post(
    "/admin/logout",
    logoutAdmin
);

router.get(
    "/admin/session",
    adminProtect,
    getAdminSession
);


router.post(
    "/register",
    registerUser
);

router.post(
    "/login",
    loginUser,
    loginAdmin
);

router.get(
    "/me",
    protect,
    getMyProfile
);

router.patch(
    "/me",
    protect,
    updateMyProfile
);

router.get(
    "/protected-test",
    protect,
    (req, res) => {
        return res.status(200).json({
            success: true,
            message:
                "Protected route accessed successfully.",
            userId: req.userId
        });
    }
);

router.post(
    "/admin/delivery-boys",
    adminProtect,
    authorizeRoles("admin"),
    createDeliveryBoy
);

router.get(
    "/admin/delivery-boys",
    adminProtect,
    authorizeRoles("admin"),
    getDeliveryBoys
);

module.exports = router;
