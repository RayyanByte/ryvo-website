const express = require("express");

const {
    getCustomers,
    updateCustomerStatus
} = require("../controllers/user/user.admin.controller");

const {
    protect
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

const router = express.Router();

router.get(
    "/customers",
    protect,
    authorizeRoles("admin"),
    getCustomers
);

router.patch(
    "/customers/:customerId/status",
    protect,
    authorizeRoles("admin"),
    updateCustomerStatus
);

module.exports = router;
