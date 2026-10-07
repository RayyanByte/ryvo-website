const ADMIN_CATEGORY_API =
    "http://localhost:5000/api/categories";

const categoryAdminApi = {

    async getCategories() {
        const response =
            await fetch(
                ADMIN_CATEGORY_API,
                {
                    credentials: "include"
                }
            );

        return response.json();
    },

    async createCategory(payload) {
        const response =
            await fetch(
                ADMIN_CATEGORY_API,
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

    async updateCategory(
        categoryId,
        payload
    ) {
        const response =
            await fetch(
                `${ADMIN_CATEGORY_API}/${categoryId}`,
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

    async deleteCategory(categoryId) {
        const response =
            await fetch(
                `${ADMIN_CATEGORY_API}/${categoryId}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

        return response.json();
    }
};
