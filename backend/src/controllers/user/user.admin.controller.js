const User = require("../../models/user.model");

const getCustomers = async (req, res) => {
    try {
        const customers = await User.find({
            role: "customer"
        })
            .select("_id name email phone isActive createdAt")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: customers
        });
    } catch (error) {
        console.error("Get customers error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch customers."
        });
    }
};

const updateCustomerStatus = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive must be a boolean."
            });
        }

        const customer = await User.findOne({
            _id: customerId,
            role: "customer"
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found."
            });
        }

        customer.isActive = isActive;
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Customer status updated successfully.",
            data: {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                role: customer.role,
                isActive: customer.isActive
            }
        });
    } catch (error) {
        console.error("Update customer status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update customer status."
        });
    }
};

module.exports = {
    getCustomers,
    updateCustomerStatus
};
