const shopAdminApi = {

    async getStatus() {
        const response =
            await fetch("/api/shop");

        return response.json();
    },

    async update(payload) {
        const token =
            localStorage.getItem("token");

        const response =
            await fetch("/api/shop", {
                method: "PATCH",

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
    }
};
