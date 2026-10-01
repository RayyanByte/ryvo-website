const express = require("express");

const {
    registerUser,
    loginUser,
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

const router = express.Router();

router.post(
    "/register",
    registerUser
);

router.post(
    "/login",
    loginUser
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
    protect,
    authorizeRoles("admin"),
    createDeliveryBoy
);

router.get(
    "/admin/delivery-boys",
    protect,
    authorizeRoles("admin"),
    getDeliveryBoys
);

module.exports = router;
