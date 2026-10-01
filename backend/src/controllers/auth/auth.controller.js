const bcrypt = require("bcryptjs");

const User = require("../../models/user.model");

const {
    generateToken
} = require("../../utils/jwt");

const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password
        } = req.body;

        if (
            !name ||
            !email ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, email and password are required."
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    "An account with this email already exists."
            });
        }

        const hashedPassword =
            await bcrypt.hash(
                password,
                12
            );

        const user =
            await User.create({
                name: name.trim(),

                email: normalizedEmail,

                phone:
                    phone
                        ? phone.trim()
                        : "",

                password:
                    hashedPassword
            });

        return res.status(201).json({
            success: true,
            message:
                "Account created successfully.",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        console.error(
            "Registration error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while creating the account."
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (
            !email ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required."
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const user =
            await User.findOne({
                email: normalizedEmail
            });

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password."
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message:
                    "This account is inactive."
            });
        }

        const passwordMatches =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password."
            });
        }

        const token =
            generateToken(
                user._id.toString()
            );

        return res.status(200).json({
            success: true,
            message:
                "Login successful.",
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                }
            }
        });

    } catch (error) {
        console.error(
            "Login error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while logging in."
        });
    }
};

const getMyProfile = async (req, res) => {
    try {
        const user =
            await User.findById(
                req.userId
            ).select(
                "-password"
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found."
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message:
                    "This account is inactive."
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error(
            "Get profile error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while fetching the profile."
        });
    }
};

const updateMyProfile = async (req, res) => {
    try {
        const {
            name,
            phone
        } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name is required."
            });
        }

        const trimmedName =
            name.trim();

        if (
            trimmedName.length < 2 ||
            trimmedName.length > 50
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name must be between 2 and 50 characters."
            });
        }

        if (
            phone !== undefined &&
            typeof phone !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Phone must be a string."
            });
        }

        const user =
            await User.findById(
                req.userId
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found."
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message:
                    "This account is inactive."
            });
        }

        user.name = trimmedName;

        if (phone !== undefined) {
            user.phone = phone.trim();
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message:
                "Profile updated successfully.",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error(
            "Update profile error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while updating the profile."
        });
    }
};

const createDeliveryBoy = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password
        } = req.body;

        if (
            !name ||
            !email ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, email and password are required."
            });
        }

        const trimmedName = name.trim();
        const normalizedEmail =
            email.trim().toLowerCase();

        if (
            trimmedName.length < 2 ||
            trimmedName.length > 50
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name must be between 2 and 50 characters."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 6 characters."
            });
        }

        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    "An account with this email already exists."
            });
        }

        const hashedPassword =
            await bcrypt.hash(
                password,
                12
            );

        const deliveryBoy =
            await User.create({
                name: trimmedName,
                email: normalizedEmail,
                phone: phone
                    ? phone.trim()
                    : "",
                password: hashedPassword,
                role: "delivery",
                isActive: true
            });

        return res.status(201).json({
            success: true,
            message:
                "Delivery boy account created successfully.",
            data: {
                id: deliveryBoy._id,
                name: deliveryBoy.name,
                email: deliveryBoy.email,
                phone: deliveryBoy.phone,
                role: deliveryBoy.role,
                isActive: deliveryBoy.isActive
            }
        });

    } catch (error) {
        console.error(
            "Create delivery boy error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to create delivery boy account."
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMyProfile,
    updateMyProfile,
    createDeliveryBoy
};
