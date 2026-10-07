const ADMIN_SHOP_API =
    "http://localhost:5000/api/shop";

const shopAdminApi = {

    async getStatus() {
        const response =
            await fetch(
                ADMIN_SHOP_API,
                {
                    credentials: "include"
                }
            );

        return response.json();
    },

    async update(payload) {
        const response =
            await fetch(
                ADMIN_SHOP_API,
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
    }
};
