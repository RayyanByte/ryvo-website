const mongoose = require("mongoose");

const Address = require("../../models/address.model");


const addAddress = async (req, res) => {
    try {
        const {
            label,
            fullName,
            phone,
            addressLine,
            landmark,
            city,
            state,
            pincode
        } = req.body;


        if (
            !fullName ||
            !phone ||
            !addressLine ||
            !city ||
            !state ||
            !pincode
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Full name, phone, address, city, state and pincode are required."
            });
        }


        const existingAddressCount =
            await Address.countDocuments({
                userId: req.userId
            });


        if (existingAddressCount >= 3) {
            return res.status(400).json({
                success: false,
                message:
                    "You can save a maximum of 3 addresses."
            });
        }


        const isFirstAddress =
            existingAddressCount === 0;


        const address =
            await Address.create({
                userId: req.userId,

                label:
                    label || "home",

                fullName:
                    fullName.trim(),

                phone:
                    phone.trim(),

                addressLine:
                    addressLine.trim(),

                landmark:
                    landmark
                        ? landmark.trim()
                        : "",

                city:
                    city.trim(),

                state:
                    state.trim(),

                pincode:
                    pincode.trim(),

                isDefault:
                    isFirstAddress
            });


        return res.status(201).json({
            success: true,
            message:
                "Address added successfully.",
            data: {
                id: address._id,
                label: address.label,
                fullName: address.fullName,
                phone: address.phone,
                addressLine: address.addressLine,
                landmark: address.landmark,
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                isDefault: address.isDefault,
                createdAt: address.createdAt
            }
        });

    } catch (error) {
        console.error(
            "Add address error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while adding the address."
        });
    }
};


const getMyAddresses = async (req, res) => {
    try {
        const addresses =
            await Address.find({
                userId: req.userId
            })
            .sort({
                isDefault: -1,
                createdAt: -1
            })
            .select(
                "-userId"
            );


        return res.status(200).json({
            success: true,
            count: addresses.length,
            data: addresses
        });

    } catch (error) {
        console.error(
            "Get addresses error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while fetching addresses."
        });
    }
};


const updateAddress = async (req, res) => {
    try {
        const {
            addressId
        } = req.params;


        if (
            !mongoose.Types.ObjectId.isValid(
                addressId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid address ID."
            });
        }


        const {
            label,
            fullName,
            phone,
            addressLine,
            landmark,
            city,
            state,
            pincode
        } = req.body;


        if (
            !fullName ||
            !phone ||
            !addressLine ||
            !city ||
            !state ||
            !pincode
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Full name, phone, address, city, state and pincode are required."
            });
        }


        const address =
            await Address.findOne({
                _id: addressId,
                userId: req.userId
            });


        if (!address) {
            return res.status(404).json({
                success: false,
                message:
                    "Address not found."
            });
        }


        address.label =
            label || address.label;

        address.fullName =
            fullName.trim();

        address.phone =
            phone.trim();

        address.addressLine =
            addressLine.trim();

        address.landmark =
            landmark
                ? landmark.trim()
                : "";

        address.city =
            city.trim();

        address.state =
            state.trim();

        address.pincode =
            pincode.trim();


        await address.save();


        return res.status(200).json({
            success: true,
            message:
                "Address updated successfully.",
            data: {
                id: address._id,
                label: address.label,
                fullName: address.fullName,
                phone: address.phone,
                addressLine: address.addressLine,
                landmark: address.landmark,
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                isDefault: address.isDefault,
                updatedAt: address.updatedAt
            }
        });

    } catch (error) {
        console.error(
            "Update address error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while updating the address."
        });
    }
};


const deleteAddress = async (req, res) => {
    try {
        const {
            addressId
        } = req.params;


        if (
            !mongoose.Types.ObjectId.isValid(
                addressId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid address ID."
            });
        }


        const address =
            await Address.findOne({
                _id: addressId,
                userId: req.userId
            });


        if (!address) {
            return res.status(404).json({
                success: false,
                message:
                    "Address not found."
            });
        }


        const wasDefault =
            address.isDefault;


        await Address.deleteOne({
            _id: address._id
        });


        if (wasDefault) {
            const nextAddress =
                await Address.findOne({
                    userId: req.userId
                })
                .sort({
                    createdAt: -1
                });


            if (nextAddress) {
                nextAddress.isDefault = true;

                await nextAddress.save();
            }
        }


        return res.status(200).json({
            success: true,
            message:
                "Address deleted successfully."
        });

    } catch (error) {
        console.error(
            "Delete address error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while deleting the address."
        });
    }
};


const setDefaultAddress = async (req, res) => {
    try {
        const {
            addressId
        } = req.params;


        if (
            !mongoose.Types.ObjectId.isValid(
                addressId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid address ID."
            });
        }


        const address =
            await Address.findOne({
                _id: addressId,
                userId: req.userId
            });


        if (!address) {
            return res.status(404).json({
                success: false,
                message:
                    "Address not found."
            });
        }


        if (address.isDefault) {
            return res.status(200).json({
                success: true,
                message:
                    "Address is already the default address."
            });
        }


        await Address.updateMany(
            {
                userId: req.userId
            },
            {
                $set: {
                    isDefault: false
                }
            }
        );


        address.isDefault = true;

        await address.save();


        return res.status(200).json({
            success: true,
            message:
                "Default address updated successfully.",
            data: {
                id: address._id,
                label: address.label,
                isDefault: address.isDefault
            }
        });

    } catch (error) {
        console.error(
            "Set default address error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while setting the default address."
        });
    }
};


module.exports = {
    addAddress,
    getMyAddresses,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};
