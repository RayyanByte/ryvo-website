const express = require("express");

const {
    getShopStatus,
    updateShopStatus
} = require("../controllers/shop/shop.controller");

const {
    protect
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");


const router = express.Router();


router.get(
    "/",
    getShopStatus
);


router.patch(
    "/",
    protect,
    authorizeRoles("admin"),
    updateShopStatus
);


module.exports = router;
