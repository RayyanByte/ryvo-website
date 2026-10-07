const express = require("express");

const {
    protect
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

const {
    getAllPayments,
    getPaymentSummary,
    getPaymentById,
    markCodPaid,
    refundPaymentRecord
} = require(
    "../controllers/payment/payment.admin.controller"
);


const router =
    express.Router();


router.use(
    protect,
    authorizeRoles("admin")
);


router.get(
    "/summary",
    getPaymentSummary
);


router.get(
    "/",
    getAllPayments
);


router.get(
    "/:paymentId",
    getPaymentById
);


router.patch(
    "/order/:orderId/cod-paid",
    markCodPaid
);


router.patch(
    "/:paymentId/refund",
    refundPaymentRecord
);


module.exports = router;
