const mongoose = require("mongoose");

const Category = require("../../models/category.model");


const createCategory = async (req, res) => {
    try {
        const {
            name,
            description,
            image
        } = req.body;


        if (
            !name ||
            typeof name !== "string" ||
            !name.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Category name is required."
            });
        }


        const normalizedName =
            name.trim();


        const existingCategory =
            await Category.findOne({
                name: normalizedName
            });


        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message:
                    "A category with this name already exists."
            });
        }


        if (
            description !== undefined &&
            typeof description !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Description must be a string."
            });
        }


        if (
            image !== undefined &&
            typeof image !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Image must be a string."
            });
        }


        const category =
            await Category.create({
                name: normalizedName,

                description:
                    description
                        ? description.trim()
                        : "",

                image:
                    image
                        ? image.trim()
                        : ""
            });


        return res.status(201).json({
            success: true,
            message:
                "Category created successfully.",
            data: {
                id: category._id,
                name: category.name,
                description:
                    category.description,
                image: category.image,
                isActive:
                    category.isActive,
                createdAt:
                    category.createdAt
            }
        });

    } catch (error) {
        console.error(
            "Create category error:",
            error
        );


        if (
            error.code === 11000
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "A category with this name already exists."
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while creating the category."
        });
    }
};


const getCategories = async (req, res) => {
    try {
        const categories =
            await Category.find({
                isActive: true
            })
            .sort({
                name: 1
            })
            .select(
                "-__v"
            );


        return res.status(200).json({
            success: true,
            count:
                categories.length,
            data:
                categories
        });

    } catch (error) {
        console.error(
            "Get categories error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while fetching categories."
        });
    }
};


const updateCategory = async (req, res) => {
    try {
        const {
            categoryId
        } = req.params;


        if (
            !mongoose.Types.ObjectId.isValid(
                categoryId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid category ID."
            });
        }


        const {
            name,
            description,
            image,
            isActive
        } = req.body;


        if (
            name === undefined &&
            description === undefined &&
            image === undefined &&
            isActive === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "At least one field is required for update."
            });
        }


        const category =
            await Category.findById(
                categoryId
            );


        if (!category) {
            return res.status(404).json({
                success: false,
                message:
                    "Category not found."
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
                        "Category name must be a non-empty string."
                });
            }


            const normalizedName =
                name.trim();


            const duplicate =
                await Category.findOne({
                    name: normalizedName,
                    _id: {
                        $ne:
                            categoryId
                    }
                });


            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message:
                        "A category with this name already exists."
                });
            }


            category.name =
                normalizedName;
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


            category.description =
                description.trim();
        }


        if (
            image !== undefined
        ) {
            if (
                typeof image !== "string"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Image must be a string."
                });
            }


            category.image =
                image.trim();
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


            category.isActive =
                isActive;
        }


        await category.save();


        return res.status(200).json({
            success: true,
            message:
                "Category updated successfully.",
            data: {
                id: category._id,
                name: category.name,
                description:
                    category.description,
                image:
                    category.image,
                isActive:
                    category.isActive,
                updatedAt:
                    category.updatedAt
            }
        });

    } catch (error) {
        console.error(
            "Update category error:",
            error
        );


        if (
            error.code === 11000
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "A category with this name already exists."
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while updating the category."
        });
    }
};


const deleteCategory = async (req, res) => {
    try {
        const {
            categoryId
        } = req.params;


        if (
            !mongoose.Types.ObjectId.isValid(
                categoryId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid category ID."
            });
        }


        const category =
            await Category.findById(
                categoryId
            );


        if (!category) {
            return res.status(404).json({
                success: false,
                message:
                    "Category not found."
            });
        }


        if (!category.isActive) {
            return res.status(200).json({
                success: true,
                message:
                    "Category is already inactive."
            });
        }


        category.isActive =
            false;


        await category.save();


        return res.status(200).json({
            success: true,
            message:
                "Category deactivated successfully.",
            data: {
                id: category._id,
                name: category.name,
                isActive:
                    category.isActive
            }
        });

    } catch (error) {
        console.error(
            "Delete category error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while deactivating the category."
        });
    }
};


module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
};
