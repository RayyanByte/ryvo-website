const express = require("express");

const {
    checkDeliveryArea,
    getIpLocationInfo
} = require("../controllers/delivery/delivery.controller");

const {
    searchLocation,
    geocodeAddress
} = require("../controllers/delivery/location-search.controller");

const {
    checkSavedAddress
} = require("../controllers/delivery/saved-address.controller");

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


router.post(
    "/check-saved-address",
    checkSavedAddress
);


module.exports = router;
