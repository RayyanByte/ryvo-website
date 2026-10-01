const Shop = require("../../models/shop.model");

const {
    checkDeliveryRadius
} = require("../../utils/distance");

const {
    getClientIpAddress,
    getIpLocation
} = require("../../utils/ip-location");


const checkDeliveryArea = async (req, res) => {
    try {
        const {
            latitude,
            longitude
        } = req.body;


        if (
            typeof latitude !== "number" ||
            typeof longitude !== "number" ||
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Valid latitude and longitude are required."
            });
        }


        if (
            latitude < -90 ||
            latitude > 90
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Latitude must be between -90 and 90."
            });
        }


        if (
            longitude < -180 ||
            longitude > 180
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Longitude must be between -180 and 180."
            });
        }


        const shop = await Shop.findOne();


        if (!shop) {
            return res.status(500).json({
                success: false,
                message:
                    "Shop location is not configured."
            });
        }


        const {
            latitude: shopLatitude,
            longitude: shopLongitude
        } = shop.location || {};


        if (
            typeof shopLatitude !== "number" ||
            typeof shopLongitude !== "number" ||
            (
                shopLatitude === 0 &&
                shopLongitude === 0
            )
        ) {
            return res.status(503).json({
                success: false,
                message:
                    "Shop delivery location is not configured yet."
            });
        }


        const deliveryRadiusKm =
            shop.deliveryRadiusKm;


        const result =
            checkDeliveryRadius(
                latitude,
                longitude,
                shopLatitude,
                shopLongitude,
                deliveryRadiusKm
            );


        if (!result.isWithinRadius) {
            return res.status(403).json({
                success: false,
                message:
                    `Your location is ${result.distanceKm} km away. Delivery is available within ${result.deliveryRadiusKm} km. You are ${result.outsideDistanceKm} km outside the delivery area.`,
                data: result
            });
        }


        return res.status(200).json({
            success: true,
            message:
                `Delivery is available. You are ${result.distanceKm} km away.`,
            data: result
        });

    } catch (error) {
        console.error(
            "Check delivery area error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Unable to check delivery area."
        });
    }
};


const getIpLocationInfo = async (req, res) => {
    try {
        const ipAddress =
            getClientIpAddress(req);


        const location =
            await getIpLocation(
                ipAddress
            );


        return res.status(200).json({
            success: true,
            message:
                "Approximate IP location detected.",
            data: {
                city:
                    location.city,

                region:
                    location.region,

                country:
                    location.country,

                latitude:
                    location.latitude,

                longitude:
                    location.longitude
            }
        });

    } catch (error) {
        console.error(
            "Get IP location error:",
            error
        );


        return res.status(503).json({
            success: false,
            message:
                "Unable to determine approximate location from IP."
        });
    }
};


module.exports = {
    checkDeliveryArea,
    getIpLocationInfo
};
