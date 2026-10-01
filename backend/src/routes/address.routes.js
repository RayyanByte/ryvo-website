const express = require("express");

const {
    addAddress,
    getMyAddresses,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} = require("../controllers/address/address.controller");

const {
    protect
} = require("../middleware/auth.middleware");


const router = express.Router();


router.post(
    "/",
    protect,
    addAddress
);


router.get(
    "/",
    protect,
    getMyAddresses
);


router.patch(
    "/:addressId/default",
    protect,
    setDefaultAddress
);


router.patch(
    "/:addressId",
    protect,
    updateAddress
);


router.delete(
    "/:addressId",
    protect,
    deleteAddress
);


module.exports = router;
