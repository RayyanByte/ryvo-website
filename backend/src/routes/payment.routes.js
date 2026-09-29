const express = require("express");

const {
    protect
} = require("../middleware/auth.middleware");

const {
    createPayment,
    getMyPayment
} = require("../controllers/payment/payment.controller");

const router = express.Router();

router.post(
    "/",
    protect,
    createPayment
);

router.get(
    "/:orderId",
    protect,
    getMyPayment
);

module.exports = router;
