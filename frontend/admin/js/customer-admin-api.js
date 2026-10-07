const customerAdminApi = {

    async getCustomers(
        page = 1,
        search = ""
    ) {
        const token =
            localStorage.getItem("token");

        const params =
            new URLSearchParams({
                page,
                limit: 20,
                search
            });

        const response =
            await fetch(
                `/api/users/admin/customers?${params}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        return response.json();
    },

    async updateStatus(
        customerId,
        isActive
    ) {
        const token =
            localStorage.getItem("token");

        const response =
            await fetch(
                `/api/users/admin/customers/${customerId}/status`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify({
                            isActive
                        })
                }
            );

        return response.json();
    }
};
