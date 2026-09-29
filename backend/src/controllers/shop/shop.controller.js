const Shop = require("../../models/shop.model");


const getShopStatus = async (req, res) => {
    try {
        let shop = await Shop.findOne();


        if (!shop) {
            shop = await Shop.create({
                isOpen: true,
                statusMessage: "Shop is open.",
                location: {
                    latitude: 0,
                    longitude: 0
                },
                deliveryRadiusKm: 2
            });
        }


        return res.status(200).json({
            success: true,
            data: {
                isOpen: shop.isOpen,
                statusMessage: shop.statusMessage,

                location: {
                    latitude:
                        shop.location.latitude,
                    longitude:
                        shop.location.longitude
                },

                deliveryRadiusKm:
                    shop.deliveryRadiusKm,

                updatedAt:
                    shop.updatedAt
            }
        });

    } catch (error) {
        console.error(
            "Get shop status error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while fetching shop status."
        });
    }
};


const updateShopStatus = async (req, res) => {
    try {
        const {
            isOpen,
            statusMessage,
            location,
            deliveryRadiusKm
        } = req.body;


        if (
            typeof isOpen !== "boolean"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "isOpen must be a boolean."
            });
        }


        if (
            statusMessage !== undefined &&
            (
                typeof statusMessage !== "string" ||
                !statusMessage.trim()
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "statusMessage must be a non-empty string."
            });
        }


        if (
            location !== undefined
        ) {
            if (
                typeof location !== "object" ||
                location === null ||
                typeof location.latitude !== "number" ||
                typeof location.longitude !== "number"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "location must contain valid latitude and longitude."
                });
            }


            if (
                location.latitude < -90 ||
                location.latitude > 90
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Latitude must be between -90 and 90."
                });
            }


            if (
                location.longitude < -180 ||
                location.longitude > 180
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Longitude must be between -180 and 180."
                });
            }
        }


        if (
            deliveryRadiusKm !== undefined &&
            (
                typeof deliveryRadiusKm !== "number" ||
                !Number.isFinite(deliveryRadiusKm) ||
                deliveryRadiusKm < 0.1 ||
                deliveryRadiusKm > 100
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "deliveryRadiusKm must be between 0.1 and 100 km."
            });
        }


        let shop =
            await Shop.findOne();


        if (!shop) {
            shop =
                new Shop();
        }


        shop.isOpen =
            isOpen;


        if (
            statusMessage !== undefined
        ) {
            shop.statusMessage =
                statusMessage.trim();
        } else {
            shop.statusMessage =
                isOpen
                    ? "Shop is open."
                    : "Shop is currently closed.";
        }


        if (
            location !== undefined
        ) {
            shop.location.latitude =
                location.latitude;

            shop.location.longitude =
                location.longitude;
        }


        if (
            deliveryRadiusKm !== undefined
        ) {
            shop.deliveryRadiusKm =
                deliveryRadiusKm;
        }


        await shop.save();


        return res.status(200).json({
            success: true,
            message:
                "Shop settings updated successfully.",
            data: {
                isOpen:
                    shop.isOpen,

                statusMessage:
                    shop.statusMessage,

                location: {
                    latitude:
                        shop.location.latitude,
                    longitude:
                        shop.location.longitude
                },

                deliveryRadiusKm:
                    shop.deliveryRadiusKm,

                updatedAt:
                    shop.updatedAt
            }
        });

    } catch (error) {
        console.error(
            "Update shop status error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while updating shop settings."
        });
    }
};


module.exports = {
    getShopStatus,
    updateShopStatus
};
