const express = require("express");

const {
    protect
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

const {
    getDeliveryBoys
} = require(
    "../controllers/delivery/delivery.admin.controller"
);


const router =
    express.Router();


router.get(
    "/",
    protect,
    authorizeRoles("admin"),
    getDeliveryBoys
);


module.exports = router;
