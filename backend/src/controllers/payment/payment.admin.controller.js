const mongoose = require("mongoose");

const Payment = require("../../models/payment.model");
const Order = require("../../models/order.model");
const User = require("../../models/user.model");


const getAllPayments = async (
    req,
    res
) => {
    try {
        const {
            status,
            method,
            page = "1",
            limit = "20"
        } = req.query;

        const pageNumber =
            Number(page);

        const limitNumber =
            Number(limit);

        if (
            !Number.isInteger(
                pageNumber
            ) ||
            pageNumber < 1
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid page."
            });
        }

        if (
            !Number.isInteger(
                limitNumber
            ) ||
            limitNumber < 1 ||
            limitNumber > 100
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid limit."
            });
        }

        const filter = {};

        if (status) {
            if (
                ![
                    "pending",
                    "paid",
                    "failed",
                    "cancelled",
                    "refunded"
                ].includes(status)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid payment status."
                });
            }

            filter.paymentStatus =
                status;
        }

        if (method) {
            if (
                ![
                    "cod",
                    "upi"
                ].includes(method)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid payment method."
                });
            }

            filter.paymentMethod =
                method;
        }

        const skip =
            (pageNumber - 1) *
            limitNumber;

        const [
            payments,
            total
        ] = await Promise.all([
            Payment.find(filter)
                .populate(
                    "customer",
                    "name email phone role"
                )
                .populate(
                    "order",
                    "status totalAmount paymentMethod paymentStatus createdAt"
                )
                .sort({
                    createdAt: -1
                })
                .skip(skip)
                .limit(limitNumber)
                .select("-__v"),

            Payment.countDocuments(
                filter
            )
        ]);

        return res.status(200).json({
            success: true,
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPages:
                Math.ceil(
                    total /
                    limitNumber
                ),
            data: payments
        });

    } catch (error) {
        console.error(
            "Get all payments error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch payments."
        });
    }
};


const getPaymentSummary = async (
    req,
    res
) => {
    try {
        const [
            pending,
            paid,
            failed,
            cancelled,
            refunded,
            cod,
            upi
        ] = await Promise.all([
            Payment.countDocuments({
                paymentStatus:
                    "pending"
            }),

            Payment.countDocuments({
                paymentStatus:
                    "paid"
            }),

            Payment.countDocuments({
                paymentStatus:
                    "failed"
            }),

            Payment.countDocuments({
                paymentStatus:
                    "cancelled"
            }),

            Payment.countDocuments({
                paymentStatus:
                    "refunded"
            }),

            Payment.countDocuments({
                paymentMethod:
                    "cod"
            }),

            Payment.countDocuments({
                paymentMethod:
                    "upi"
            })
        ]);

        const paidRevenue =
            await Payment.aggregate([
                {
                    $match: {
                        paymentStatus:
                            "paid"
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum:
                                "$amount"
                        }
                    }
                }
            ]);

        return res.status(200).json({
            success: true,
            data: {
                status: {
                    pending,
                    paid,
                    failed,
                    cancelled,
                    refunded
                },

                method: {
                    cod,
                    upi
                },

                paidRevenue:
                    paidRevenue[0]
                        ?.total || 0
            }
        });

    } catch (error) {
        console.error(
            "Get payment summary error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch payment summary."
        });
    }
};


const getPaymentById = async (
    req,
    res
) => {
    try {
        const { paymentId } =
            req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                paymentId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid payment ID."
            });
        }

        const payment =
            await Payment.findById(
                paymentId
            )
                .populate(
                    "customer",
                    "name email phone role isActive"
                )
                .populate(
                    "order"
                )
                .select("-__v");

        if (!payment) {
            return res.status(404).json({
                success: false,
                message:
                    "Payment not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: payment
        });

    } catch (error) {
        console.error(
            "Get payment by ID error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch payment."
        });
    }
};


const markCodPaid = async (
    req,
    res
) => {
    try {
        const { orderId } =
            req.params;

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

        const payment =
            await Payment.findOne({
                order: orderId,
                paymentMethod: "cod"
            });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message:
                    "COD payment not found."
            });
        }

        if (
            payment.paymentStatus ===
            "paid"
        ) {
            return res.status(200).json({
                success: true,
                message:
                    "COD payment is already paid.",
                data: payment
            });
        }

        if (
            payment.paymentStatus !==
            "pending"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Only pending COD payments can be marked paid."
            });
        }

        payment.paymentStatus =
            "paid";

        payment.paidAt =
            new Date();

        await payment.save();

        await Order.findByIdAndUpdate(
            orderId,
            {
                paymentStatus: "paid"
            }
        );

        return res.status(200).json({
            success: true,
            message:
                "COD payment marked as paid.",
            data: payment
        });

    } catch (error) {
        console.error(
            "Mark COD paid error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to mark COD payment paid."
        });
    }
};


const refundPaymentRecord = async (
    req,
    res
) => {
    try {
        const { paymentId } =
            req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                paymentId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid payment ID."
            });
        }

        const payment =
            await Payment.findById(
                paymentId
            );

        if (!payment) {
            return res.status(404).json({
                success: false,
                message:
                    "Payment not found."
            });
        }

        if (
            payment.paymentStatus !==
            "paid"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Only paid payments can be refunded."
            });
        }

        payment.paymentStatus =
            "refunded";

        await payment.save();

        await Order.findByIdAndUpdate(
            payment.order,
            {
                paymentStatus: "failed"
            }
        );

        return res.status(200).json({
            success: true,
            message:
                "Payment marked as refunded.",
            data: payment
        });

    } catch (error) {
        console.error(
            "Refund payment record error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to refund payment."
        });
    }
};


module.exports = {
    getAllPayments,
    getPaymentSummary,
    getPaymentById,
    markCodPaid,
    refundPaymentRecord
};
