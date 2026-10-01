const express = require("express");

const {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    updateOrderStatus,
    assignDeliveryBoy,
    getMyDeliveryOrders,
    updateDeliveryOrderStatus,
    getAllOrders
} = require("../controllers/order/order.controller");

const {
    protect
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

const router = express.Router();

router.post(
    "/",
    protect,
    createOrder
);

router.get(
    "/my",
    protect,
    getMyOrders
);

router.get(
    "/delivery/my",
    protect,
    authorizeRoles("delivery"),
    getMyDeliveryOrders
);

router.get(
    "/admin",
    protect,
    authorizeRoles("admin"),
    getAllOrders
);

router.patch(
    "/:orderId/assign-delivery",
    protect,
    authorizeRoles("admin"),
    assignDeliveryBoy
);

router.patch(
    "/:orderId/delivery-status",
    protect,
    authorizeRoles("delivery"),
    updateDeliveryOrderStatus
);

router.patch(
    "/:orderId/cancel",
    protect,
    cancelOrder
);

router.patch(
    "/:orderId/status",
    protect,
    authorizeRoles("admin"),
    updateOrderStatus
);

router.get(
    "/:orderId",
    protect,
    getOrderById
);

module.exports = router;
