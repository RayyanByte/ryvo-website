const categoryAdminApi = {

    async getCategories() {
        const response =
            await fetch("/api/categories");

        return response.json();
    },

    async createCategory(payload) {
        const token =
            localStorage.getItem("token");

        const response =
            await fetch("/api/categories", {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`
                },

                body:
                    JSON.stringify(payload)
            });

        return response.json();
    },

    async updateCategory(
        categoryId,
        payload
    ) {
        const token =
            localStorage.getItem("token");

        const response =
            await fetch(
                `/api/categories/${categoryId}`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify(payload)
                }
            );

        return response.json();
    },

    async deleteCategory(categoryId) {
        const token =
            localStorage.getItem("token");

        const response =
            await fetch(
                `/api/categories/${categoryId}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        return response.json();
    }
};
