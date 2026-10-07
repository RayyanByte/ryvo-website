const foodAdminApi = {
    async getFoods(category = "") {
        const url = category
            ? `/api/foods?category=${encodeURIComponent(category)}`
            : "/api/foods";

        const response = await fetch(url);
        return response.json();
    },

    async getCategories() {
        const response = await fetch("/api/categories");
        return response.json();
    },

    async createFood(payload) {
        const token = localStorage.getItem("token");

        const response = await fetch("/api/foods", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        return response.json();
    },

    async updateFood(foodId, payload) {
        const token = localStorage.getItem("token");

        const response = await fetch(`/api/foods/${foodId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        return response.json();
    },

    async deleteFood(foodId) {
        const token = localStorage.getItem("token");

        const response = await fetch(`/api/foods/${foodId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.json();
    }
};
