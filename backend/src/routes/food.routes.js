const express = require("express");

const {
    createFood,
    getFoods,
    getFoodById,
    updateFood,
    deleteFood
} = require("../controllers/food/food.controller");

const {
    protect
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");


const router = express.Router();


/*
    Customer/Public
    Food list.
*/
router.get(
    "/",
    getFoods
);


/*
    Customer/Public
    Single food detail.
*/
router.get(
    "/:foodId",
    getFoodById
);


/*
    Admin Only
    Create food.
*/
router.post(
    "/",
    protect,
    authorizeRoles("admin"),
    createFood
);


/*
    Admin Only
    Update food.
*/
router.patch(
    "/:foodId",
    protect,
    authorizeRoles("admin"),
    updateFood
);


/*
    Admin Only
    Deactivate food.
*/
router.delete(
    "/:foodId",
    protect,
    authorizeRoles("admin"),
    deleteFood
);


module.exports = router;
