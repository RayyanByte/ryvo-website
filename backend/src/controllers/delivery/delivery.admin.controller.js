const User = require("../../models/user.model");


const getDeliveryBoys = async (
    req,
    res
) => {
    try {
        const deliveryBoys =
            await User.find({
                role: "delivery",
                isActive: true
            })
                .select(
                    "_id name email phone role isActive"
                )
                .sort({
                    name: 1
                });

        return res.status(200).json({
            success: true,
            count:
                deliveryBoys.length,
            data:
                deliveryBoys
        });

    } catch (error) {
        console.error(
            "Get delivery boys error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch delivery boys."
        });
    }
};


module.exports = {
    getDeliveryBoys
};
