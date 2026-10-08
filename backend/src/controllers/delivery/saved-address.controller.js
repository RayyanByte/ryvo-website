const mongoose = require("mongoose");

const Address = require("../../models/address.model");
const Shop = require("../../models/shop.model");

const {
    getRoadDistanceKm
} = require("../../utils/road-distance");

const {
    getEstimatedDeliveryTime
} = require("../../utils/delivery-time");


const checkSavedAddress = async (req, res) => {
    try {
        const { addressId } = req.body;

        if (!addressId) {
            return res.status(400).json({
                success: false,
                message: "Address ID is required."
            });
        }

        if (!mongoose.Types.ObjectId.isValid(addressId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID."
            });
        }

        const address = await Address.findById(addressId);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found."
            });
        }

        const shop = await Shop.findOne();

        if (!shop) {
            return res.status(500).json({
                success: false,
                message: "Shop location is not configured."
            });
        }

        const shopLatitude =
            shop.location && shop.location.latitude;

        const shopLongitude =
            shop.location && shop.location.longitude;

        if (
            typeof shopLatitude !== "number" ||
            typeof shopLongitude !== "number" ||
            (shopLatitude === 0 && shopLongitude === 0)
        ) {
            return res.status(503).json({
                success: false,
                message: "Shop delivery location is not configured yet."
            });
        }

        const queryParts = [
            address.area,
            address.pincode,
            address.city,
            address.state,
            "India"
        ].filter(Boolean);

        const searchUrl =
            "https://nominatim.openstreetmap.org/search?" +
            new URLSearchParams({
                q: queryParts.join(", "),
                format: "jsonv2",
                limit: "1",
                addressdetails: "1",
                countrycodes: "in"
            }).toString();

        let geoResponse;

        try {
            geoResponse = await fetch(searchUrl, {
                headers: {
                    "User-Agent": "RYVO-Food-Delivery/1.0"
                }
            });
        } catch (netErr) {
            console.error("Geocode network error:", netErr);
            return res.status(503).json({
                success: false,
                message: "Unable to check this address right now. Please try again."
            });
        }

        if (!geoResponse.ok) {
            return res.status(503).json({
                success: false,
                message: "Unable to check this address right now. Please try again."
            });
        }

        const geoResults = await geoResponse.json();

        if (!Array.isArray(geoResults) || !geoResults.length) {
            return res.status(200).json({
                success: true,
                data: {
                    available: false,
                    message: "Delivery not available in this area."
                }
            });
        }

        const match = geoResults[0];

        const addressLatitude = Number(match.lat);
        const addressLongitude = Number(match.lon);

        if (
            !Number.isFinite(addressLatitude) ||
            !Number.isFinite(addressLongitude)
        ) {
            return res.status(503).json({
                success: false,
                message: "Unable to check this address right now. Please try again."
            });
        }

        const deliveryRadiusKm = shop.deliveryRadiusKm;

        let distanceKm = null;
        let usedRoadDistance = true;

        try {
            distanceKm = await getRoadDistanceKm(
                shopLatitude,
                shopLongitude,
                addressLatitude,
                addressLongitude
            );
        } catch (roadError) {
            console.error("Road distance error:", roadError.message);

            const {
                checkDeliveryRadius
            } = require("../../utils/distance");

            const fallback = checkDeliveryRadius(
                shopLatitude,
                shopLongitude,
                addressLatitude,
                addressLongitude,
                deliveryRadiusKm
            );

            distanceKm = fallback.distanceKm;
            usedRoadDistance = false;
        }

        const isWithinRadius = distanceKm <= deliveryRadiusKm;

        if (!isWithinRadius) {
            const outsideDistanceKm = Number(
                (distanceKm - deliveryRadiusKm).toFixed(2)
            );

            return res.status(200).json({
                success: true,
                data: {
                    available: false,
                    message: "Delivery not available in this area.",
                    distanceKm: distanceKm,
                    deliveryRadiusKm: Number(deliveryRadiusKm.toFixed(2)),
                    outsideDistanceKm: outsideDistanceKm,
                    latitude: addressLatitude,
                    longitude: addressLongitude,
                    roadDistance: usedRoadDistance
                }
            });
        }

        const estimatedTime = getEstimatedDeliveryTime(
            distanceKm,
            shop.deliveryTimeRanges
        );

        return res.status(200).json({
            success: true,
            data: {
                available: true,
                message: "Delivery available at this address.",
                distanceKm: distanceKm,
                deliveryRadiusKm: Number(deliveryRadiusKm.toFixed(2)),
                latitude: addressLatitude,
                longitude: addressLongitude,
                roadDistance: usedRoadDistance,
                estimatedTime: estimatedTime
            }
        });

    } catch (error) {
        console.error("Check saved address error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to check this address right now."
        });
    }
};


module.exports = {
    checkSavedAddress
};
