const mongoose = require("mongoose");

const Order = require("../../models/order.model");
const Address = require("../../models/address.model");
const Food = require("../../models/food.model");
const Shop = require("../../models/shop.model");
const User = require("../../models/user.model");
const { checkDeliveryRadius } = require("../../utils/distance");

const ORDER_STATUS_TRANSITIONS = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["preparing"],
    preparing: ["out_for_delivery"],
    out_for_delivery: ["delivered"],
    delivered: [],
    cancelled: []
};

const ORDER_STATUSES = [
    "pending",
    "confirmed",
    "preparing",
    "out_for_delivery",
    "delivered",
    "cancelled"
];

const DELIVERY_STATUS_TRANSITIONS = {
    confirmed: ["preparing"],
    preparing: ["out_for_delivery"],
    out_for_delivery: ["delivered"]
};

const canTransitionOrderStatus = (currentStatus, nextStatus) => {
    return (
        ORDER_STATUS_TRANSITIONS[currentStatus] || []
    ).includes(nextStatus);
};

const canTransitionDeliveryStatus = (
    currentStatus,
    nextStatus
) => {
    return (
        DELIVERY_STATUS_TRANSITIONS[currentStatus] || []
    ).includes(nextStatus);
};

const createOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const {
            addressId,
            deliveryLocation,
            items,
            paymentMethod
        } = req.body;

        if (!addressId) {
            return res.status(400).json({
                success: false,
                message: "Delivery address is required."
            });
        }

        if (
            !deliveryLocation ||
            typeof deliveryLocation !== "object"
        ) {
            return res.status(400).json({
                success: false,
                message: "Confirmed delivery location is required."
            });
        }

        const {
            latitude,
            longitude,
            source,
            isApproximate
        } = deliveryLocation;

        if (
            typeof latitude !== "number" ||
            !Number.isFinite(latitude) ||
            latitude < -90 ||
            latitude > 90
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid delivery latitude."
            });
        }

        if (
            typeof longitude !== "number" ||
            !Number.isFinite(longitude) ||
            longitude < -180 ||
            longitude > 180
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid delivery longitude."
            });
        }

        if (
            !["gps", "map", "search", "address"].includes(source)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid delivery location source."
            });
        }

        if (typeof isApproximate !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "Invalid delivery location accuracy flag."
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Order must contain at least one item."
            });
        }

        if (!["cod", "upi"].includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method."
            });
        }

        if (!mongoose.Types.ObjectId.isValid(addressId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID."
            });
        }

        const shop = await Shop.findOne();

        if (!shop || !shop.isOpen) {
            return res.status(403).json({
                success: false,
                message:
                    shop?.statusMessage ||
                    "Shop is currently closed."
            });
        }

        if (
            !shop.location ||
            typeof shop.location.latitude !== "number" ||
            typeof shop.location.longitude !== "number" ||
            !Number.isFinite(shop.location.latitude) ||
            !Number.isFinite(shop.location.longitude) ||
            (
                shop.location.latitude === 0 &&
                shop.location.longitude === 0
            )
        ) {
            return res.status(503).json({
                success: false,
                message:
                    "Shop delivery location is not configured yet."
            });
        }

        const deliveryCheck = checkDeliveryRadius(
            shop.location.latitude,
            shop.location.longitude,
            latitude,
            longitude,
            shop.deliveryRadiusKm
        );

        if (!deliveryCheck.isWithinRadius) {
            return res.status(403).json({
                success: false,
                message:
                    `Your delivery location is ${deliveryCheck.distanceKm} km away. ` +
                    `Delivery is available within ${deliveryCheck.deliveryRadiusKm} km. ` +
                    `You are ${deliveryCheck.outsideDistanceKm} km outside the delivery area.`,
                data: {
                    isWithinRadius: false,
                    distanceKm: deliveryCheck.distanceKm,
                    deliveryRadiusKm:
                        deliveryCheck.deliveryRadiusKm,
                    outsideDistanceKm:
                        deliveryCheck.outsideDistanceKm
                }
            });
        }

        const address = await Address.findOne({
            _id: addressId,
            userId
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Delivery address not found."
            });
        }

        const foodIds = [];

        for (const item of items) {
            if (
                !item ||
                !mongoose.Types.ObjectId.isValid(item.foodId) ||
                !Number.isInteger(item.quantity) ||
                item.quantity < 1
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid order item."
                });
            }

            foodIds.push(item.foodId);
        }

        const uniqueFoodIds = [
            ...new Set(
                foodIds.map((id) => id.toString())
            )
        ];

        const foods = await Food.find({
            _id: {
                $in: uniqueFoodIds
            },
            isActive: true,
            isAvailable: true
        });

        if (foods.length !== uniqueFoodIds.length) {
            return res.status(400).json({
                success: false,
                message:
                    "One or more selected foods are unavailable."
            });
        }

        const foodMap = new Map(
            foods.map((food) => [
                food._id.toString(),
                food
            ])
        );

        const orderItems = items.map((item) => {
            const food = foodMap.get(
                item.foodId.toString()
            );

            const total =
                food.price * item.quantity;

            return {
                foodId: food._id,
                name: food.name,
                price: food.price,
                quantity: item.quantity,
                total
            };
        });

        const subtotal = orderItems.reduce(
            (sum, item) => sum + item.total,
            0
        );

        const deliveryFee = 0;
        const totalAmount =
            subtotal + deliveryFee;

        const order = await Order.create({
            userId,
            addressId,
            deliveryLocation: {
                latitude,
                longitude,
                source,
                isApproximate,
                distanceKm:
                    deliveryCheck.distanceKm
            },
            items: orderItems,
            subtotal,
            deliveryFee,
            totalAmount,
            status: "pending",
            paymentMethod,
            paymentStatus: "pending"
        });

        return res.status(201).json({
            success: true,
            message: "Order created successfully.",
            data: order
        });
    } catch (error) {
        console.error(
            "Create order error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to create order."
        });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const userId = req.userId;

        const orders = await Order.find({
            userId
        })
            .populate(
                "addressId",
                "label fullName phone addressLine landmark city state pincode"
            )
            .sort({
                createdAt: -1
            })
            .select("-__v");

        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error(
            "Get my orders error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders."
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        const userId = req.userId;
        const { orderId } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(orderId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID."
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            userId
        })
            .populate(
                "addressId",
                "label fullName phone addressLine landmark city state pincode"
            )
            .select("-__v");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error(
            "Get order by ID error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch order."
        });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const { orderId } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(orderId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID."
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            userId
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        if (order.status !== "pending") {
            return res.status(400).json({
                success: false,
                message:
                    "Only pending orders can be cancelled."
            });
        }

        order.status = "cancelled";

        await order.save();

        return res.status(200).json({
            success: true,
            message:
                "Order cancelled successfully.",
            data: order
        });
    } catch (error) {
        console.error(
            "Cancel order error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to cancel order."
        });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status: nextStatus } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(orderId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID."
            });
        }

        if (
            typeof nextStatus !== "string" ||
            !Object.prototype.hasOwnProperty.call(
                ORDER_STATUS_TRANSITIONS,
                nextStatus
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status."
            });
        }

        const order = await Order.findById(
            orderId
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        if (
            !canTransitionOrderStatus(
                order.status,
                nextStatus
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `Invalid status transition from ${order.status} to ${nextStatus}.`
            });
        }

        order.status = nextStatus;

        await order.save();

        return res.status(200).json({
            success: true,
            message:
                "Order status updated successfully.",
            data: order
        });
    } catch (error) {
        console.error(
            "Update order status error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update order status."
        });
    }
};

const assignDeliveryBoy = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { deliveryBoyId } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(orderId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID."
            });
        }

        if (!deliveryBoyId) {
            return res.status(400).json({
                success: false,
                message:
                    "Delivery boy ID is required."
            });
        }

        if (
            !mongoose.Types.ObjectId.isValid(
                deliveryBoyId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid delivery boy ID."
            });
        }

        const order = await Order.findById(
            orderId
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        if (
            ["delivered", "cancelled"].includes(
                order.status
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Delivered or cancelled orders cannot be assigned."
            });
        }

        const deliveryBoy = await User.findOne({
            _id: deliveryBoyId,
            role: "delivery",
            isActive: true
        }).select(
            "_id name email phone role isActive"
        );

        if (!deliveryBoy) {
            return res.status(404).json({
                success: false,
                message:
                    "Active delivery boy not found."
            });
        }

        order.deliveryBoyId =
            deliveryBoy._id;

        await order.save();

        await order.populate({
            path: "deliveryBoyId",
            select:
                "name email phone role isActive"
        });

        return res.status(200).json({
            success: true,
            message:
                "Delivery boy assigned successfully.",
            data: order
        });
    } catch (error) {
        console.error(
            "Assign delivery boy error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to assign delivery boy."
        });
    }
};

const getMyDeliveryOrders = async (req, res) => {
    try {
        const deliveryBoyId =
            req.userId;

        const orders = await Order.find({
            deliveryBoyId,
            status: {
                $ne: "cancelled"
            }
        })
            .populate(
                "userId",
                "name email phone role"
            )
            .populate(
                "addressId",
                "label fullName phone addressLine landmark city state pincode"
            )
            .populate(
                "deliveryBoyId",
                "name email phone role isActive"
            )
            .sort({
                createdAt: -1
            })
            .select("-__v");

        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error(
            "Get delivery orders error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch assigned orders."
        });
    }
};

const updateDeliveryOrderStatus = async (
    req,
    res
) => {
    try {
        const deliveryBoyId =
            req.userId;

        const { orderId } = req.params;
        const {
            status: nextStatus
        } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(
                orderId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid order ID."
            });
        }

        if (
            typeof nextStatus !== "string" ||
            !ORDER_STATUSES.includes(
                nextStatus
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid delivery order status."
            });
        }

        const order =
            await Order.findOne({
                _id: orderId,
                deliveryBoyId
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message:
                    "Assigned order not found."
            });
        }

        if (
            !canTransitionDeliveryStatus(
                order.status,
                nextStatus
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `Invalid delivery status transition from ${order.status} to ${nextStatus}.`
            });
        }

        order.status = nextStatus;

        await order.save();

        return res.status(200).json({
            success: true,
            message:
                "Delivery order status updated successfully.",
            data: order
        });
    } catch (error) {
        console.error(
            "Update delivery order status error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update delivery order status."
        });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const { status } = req.query;

        const pageValue =
            req.query.page ?? "1";

        const limitValue =
            req.query.limit ?? "10";

        if (
            !/^\d+$/.test(pageValue) ||
            !/^\d+$/.test(limitValue)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Page and limit must be positive integers."
            });
        }

        const page = Number(pageValue);
        const limit = Number(limitValue);

        if (
            page < 1 ||
            limit < 1 ||
            limit > 50
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Page must be at least 1 and limit must be between 1 and 50."
            });
        }

        const filter = {};

        if (status !== undefined) {
            if (
                !ORDER_STATUSES.includes(status)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid order status filter."
                });
            }

            filter.status = status;
        }

        const skip =
            (page - 1) * limit;

        const [
            orders,
            totalOrders
        ] = await Promise.all([
            Order.find(filter)
                .populate(
                    "userId",
                    "name email phone role"
                )
                .populate(
                    "addressId",
                    "label fullName phone addressLine landmark city state pincode"
                )
                .populate(
                    "deliveryBoyId",
                    "name email phone role isActive"
                )
                .sort({
                    createdAt: -1
                })
                .skip(skip)
                .limit(limit)
                .select("-__v"),

            Order.countDocuments(filter)
        ]);

        const totalPages =
            Math.ceil(
                totalOrders / limit
            );

        return res.status(200).json({
            success: true,
            count: orders.length,
            page,
            limit,
            totalOrders,
            totalPages,
            data: orders
        });
    } catch (error) {
        console.error(
            "Get all orders error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch all orders."
        });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    updateOrderStatus,
    assignDeliveryBoy,
    getMyDeliveryOrders,
    updateDeliveryOrderStatus,
    getAllOrders,
    ORDER_STATUS_TRANSITIONS,
    ORDER_STATUSES,
    DELIVERY_STATUS_TRANSITIONS,
    canTransitionOrderStatus,
    canTransitionDeliveryStatus
};
