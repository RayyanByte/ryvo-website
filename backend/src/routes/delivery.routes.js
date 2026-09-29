const express = require("express");

const {
    checkDeliveryArea,
    getIpLocationInfo
} = require("../controllers/delivery/delivery.controller");

const {
    searchLocation,
    geocodeAddress
} = require("../controllers/delivery/location-search.controller");

const router = express.Router();


router.post(
    "/check-area",
    checkDeliveryArea
);


router.get(
    "/ip-location",
    getIpLocationInfo
);


router.get(
    "/search-location",
    searchLocation
);


router.post(
    "/geocode-address",
    geocodeAddress
);


module.exports = router;
