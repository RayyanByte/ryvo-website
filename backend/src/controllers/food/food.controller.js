const mongoose = require("mongoose");

const Food = require("../../models/food.model");
const Category = require("../../models/category.model");


const validateActiveCategory = async (
    categoryId
) => {
    if (
        typeof categoryId !== "string" ||
        !categoryId.trim()
    ) {
        return {
            valid: false,
            status: 400,
            message:
                "Category must be a valid category ID."
        };
    }


    const normalizedCategoryId =
        categoryId.trim();


    if (
        !mongoose.Types.ObjectId.isValid(
            normalizedCategoryId
        )
    ) {
        return {
            valid: false,
            status: 400,
            message:
                "Invalid category ID."
        };
    }


    const category =
        await Category.findOne({
            _id: normalizedCategoryId,
            isActive: true
        });


    if (!category) {
        return {
            valid: false,
            status: 404,
            message:
                "Category not found or inactive."
        };
    }


    return {
        valid: true,
        category
    };
};


const createFood = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            price,
            media
        } = req.body;


        if (
            !name ||
            !category ||
            price === undefined ||
            price === null
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, category and price are required."
            });
        }


        if (
            typeof name !== "string" ||
            !name.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Food name must be a non-empty string."
            });
        }


        const categoryValidation =
            await validateActiveCategory(
                category
            );


        if (
            !categoryValidation.valid
        ) {
            return res.status(
                categoryValidation.status
            ).json({
                success: false,
                message:
                    categoryValidation.message
            });
        }


        if (
            typeof price !== "number" ||
            !Number.isFinite(price) ||
            price < 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Price must be a valid non-negative number."
            });
        }


        const images =
            media &&
            Array.isArray(media.images)
                ? media.images
                : [];


        const video =
            media &&
            typeof media.video === "string"
                ? media.video.trim()
                : "";


        const validImages =
            images.filter(
                (image) =>
                    typeof image === "string" &&
                    image.trim() !== ""
            );


        const food =
            await Food.create({
                name:
                    name.trim(),

                description:
                    description
                        ? description.trim()
                        : "",

                category:
                    categoryValidation.category._id,

                price,

                media: {
                    images:
                        validImages.map(
                            (image) =>
                                image.trim()
                        ),

                    video
                }
            });


        return res.status(201).json({
            success: true,
            message:
                "Food created successfully.",
            data: {
                id: food._id,
                name: food.name,
                description:
                    food.description,
                category:
                    food.category,
                price: food.price,
                media: food.media,
                isAvailable:
                    food.isAvailable,
                isActive:
                    food.isActive,
                createdAt:
                    food.createdAt
            }
        });

    } catch (error) {
        console.error(
            "Create food error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while creating the food."
        });
    }
};


const getFoods = async (req, res) => {
    try {
        const { category } = req.query;

        const filter = {
            isActive: true
        };

        if (category !== undefined) {
            if (
                typeof category !== "string" ||
                !category.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Category must be a valid category ID."
                });
            }

            const normalizedCategoryId =
                category.trim();

            if (
                !mongoose.Types.ObjectId.isValid(
                    normalizedCategoryId
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid category ID."
                });
            }

            const activeCategory =
                await Category.findOne({
                    _id: normalizedCategoryId,
                    isActive: true
                });

            if (!activeCategory) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Category not found or inactive."
                });
            }

            filter.category =
                activeCategory._id;
        }

        const foods =
            await Food.find(filter)
            .populate(
                "category",
                "name description image isActive"
            )
            .sort({
                category: 1,
                name: 1
            })
            .select(
                "-__v"
            );

        return res.status(200).json({
            success: true,
            count:
                foods.length,
            data:
                foods
        });

    } catch (error) {
        console.error(
            "Get foods error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while fetching foods."
        });
    }
};


const getFoodById = async (req, res) => {
    try {
        const {
            foodId
        } = req.params;


        if (
            !mongoose.Types.ObjectId.isValid(
                foodId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid food ID."
            });
        }


        const food =
            await Food.findOne({
                _id: foodId,
                isActive: true
            })
            .populate(
                "category",
                "name description image isActive"
            )
            .select(
                "-__v"
            );


        if (!food) {
            return res.status(404).json({
                success: false,
                message:
                    "Food not found."
            });
        }


        return res.status(200).json({
            success: true,
            data:
                food
        });

    } catch (error) {
        console.error(
            "Get food by ID error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while fetching the food."
        });
    }
};


const updateFood = async (req, res) => {
    try {
        const {
            foodId
        } = req.params;


        if (
            !mongoose.Types.ObjectId.isValid(
                foodId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid food ID."
            });
        }


        const {
            name,
            description,
            category,
            price,
            media,
            isAvailable,
            isActive
        } = req.body;


        if (
            name === undefined &&
            description === undefined &&
            category === undefined &&
            price === undefined &&
            media === undefined &&
            isAvailable === undefined &&
            isActive === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "At least one field is required for update."
            });
        }


        const food =
            await Food.findById(
                foodId
            );


        if (!food) {
            return res.status(404).json({
                success: false,
                message:
                    "Food not found."
            });
        }


        if (
            name !== undefined
        ) {
            if (
                typeof name !== "string" ||
                !name.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Food name must be a non-empty string."
                });
            }

            food.name =
                name.trim();
        }


        if (
            description !== undefined
        ) {
            if (
                typeof description !== "string"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Description must be a string."
                });
            }

            food.description =
                description.trim();
        }


        if (
            category !== undefined
        ) {
            const categoryValidation =
                await validateActiveCategory(
                    category
                );


            if (
                !categoryValidation.valid
            ) {
                return res.status(
                    categoryValidation.status
                ).json({
                    success: false,
                    message:
                        categoryValidation.message
                });
            }


            food.category =
                categoryValidation.category._id;
        }


        if (
            price !== undefined
        ) {
            if (
                typeof price !== "number" ||
                !Number.isFinite(price) ||
                price < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Price must be a valid non-negative number."
                });
            }

            food.price =
                price;
        }


        if (
            media !== undefined
        ) {
            if (
                typeof media !== "object" ||
                media === null ||
                Array.isArray(media)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Media must be an object."
                });
            }


            if (
                media.images !== undefined
            ) {
                if (
                    !Array.isArray(
                        media.images
                    )
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Media images must be an array."
                    });
                }


                const validImages =
                    media.images.filter(
                        (image) =>
                            typeof image === "string" &&
                            image.trim() !== ""
                    );


                if (
                    validImages.length !==
                    media.images.length
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "All media images must be non-empty strings."
                    });
                }


                food.media.images =
                    validImages.map(
                        (image) =>
                            image.trim()
                    );
            }


            if (
                media.video !== undefined
            ) {
                if (
                    typeof media.video !== "string"
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Media video must be a string."
                    });
                }


                food.media.video =
                    media.video.trim();
            }
        }


        if (
            isAvailable !== undefined
        ) {
            if (
                typeof isAvailable !== "boolean"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "isAvailable must be a boolean."
                });
            }

            food.isAvailable =
                isAvailable;
        }


        if (
            isActive !== undefined
        ) {
            if (
                typeof isActive !== "boolean"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "isActive must be a boolean."
                });
            }

            food.isActive =
                isActive;
        }


        await food.save();


        return res.status(200).json({
            success: true,
            message:
                "Food updated successfully.",
            data: {
                id: food._id,
                name: food.name,
                description:
                    food.description,
                category:
                    food.category,
                price:
                    food.price,
                media:
                    food.media,
                isAvailable:
                    food.isAvailable,
                isActive:
                    food.isActive,
                updatedAt:
                    food.updatedAt
            }
        });

    } catch (error) {
        console.error(
            "Update food error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while updating the food."
        });
    }
};


const deleteFood = async (req, res) => {
    try {
        const {
            foodId
        } = req.params;


        if (
            !mongoose.Types.ObjectId.isValid(
                foodId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid food ID."
            });
        }


        const food =
            await Food.findById(
                foodId
            );


        if (!food) {
            return res.status(404).json({
                success: false,
                message:
                    "Food not found."
            });
        }


        if (
            !food.isActive
        ) {
            return res.status(200).json({
                success: true,
                message:
                    "Food is already inactive."
            });
        }


        food.isActive =
            false;


        await food.save();


        return res.status(200).json({
            success: true,
            message:
                "Food deactivated successfully.",
            data: {
                id: food._id,
                name: food.name,
                isActive:
                    food.isActive
            }
        });

    } catch (error) {
        console.error(
            "Delete food error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while deactivating the food."
        });
    }
};


module.exports = {
    createFood,
    getFoods,
    getFoodById,
    updateFood,
    deleteFood
};
