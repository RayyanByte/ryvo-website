const express = require("express");

const {
    protect
} = require("../middleware/auth.middleware");

const {
    createPayment,
    getMyPayment,
    verifyUpiPayment
} = require(
    "../controllers/payment/payment.controller"
);

const router =
    express.Router();


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


router.post(
    "/:orderId/verify-upi",
    protect,
    verifyUpiPayment
);


module.exports = router;
