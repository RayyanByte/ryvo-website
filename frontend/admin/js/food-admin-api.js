const ADMIN_FOOD_API =
    "http://localhost:5000/api/foods";

const ADMIN_CATEGORY_API =
    "http://localhost:5000/api/categories";

const foodAdminApi = {

    async getFoods(category = "") {
        const url = category
            ? `${ADMIN_FOOD_API}?category=${encodeURIComponent(category)}`
            : ADMIN_FOOD_API;

        const response = await fetch(
            url,
            { credentials: "include" }
        );

        return response.json();
    },

    async getCategories() {
        const response = await fetch(
            ADMIN_CATEGORY_API,
            { credentials: "include" }
        );

        return response.json();
    },

    async createFood(payload) {
        const response = await fetch(
            ADMIN_FOOD_API,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(payload)
            }
        );

        return response.json();
    },

    async updateFood(foodId, payload) {
        const response = await fetch(
            `${ADMIN_FOOD_API}/${foodId}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(payload)
            }
        );

        return response.json();
    },

    async deleteFood(foodId) {
        const response = await fetch(
            `${ADMIN_FOOD_API}/${foodId}`,
            {
                method: "DELETE",
                credentials: "include"
            }
        );

        return response.json();
    }
};
