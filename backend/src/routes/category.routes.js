const express = require("express");

const {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
} = require("../controllers/category/category.controller");

const {
    protect
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");


const router = express.Router();


/*
    Customer/Public
    Get active categories.
*/
router.get(
    "/",
    getCategories
);


/*
    Admin Only
    Create category.
*/
router.post(
    "/",
    protect,
    authorizeRoles("admin"),
    createCategory
);


/*
    Admin Only
    Update category.
*/
router.patch(
    "/:categoryId",
    protect,
    authorizeRoles("admin"),
    updateCategory
);


/*
    Admin Only
    Deactivate category.
*/
router.delete(
    "/:categoryId",
    protect,
    authorizeRoles("admin"),
    deleteCategory
);


module.exports = router;
