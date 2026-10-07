const customerAdminApi = {

    async getCustomers(
        page = 1,
        search = ""
    ) {
        const params =
            new URLSearchParams({
                page,
                limit: 20,
                search
            });

        const response =
            await fetch(
                `http://localhost:5000/api/users/admin/customers?${params}`,
                {
                    credentials: "include"
                }
            );

        return response.json();
    },

    async updateStatus(
        customerId,
        isActive
    ) {
        const response =
            await fetch(
                `http://localhost:5000/api/users/admin/customers/${customerId}/status`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body:
                        JSON.stringify({
                            isActive
                        })
                }
            );

        return response.json();
    }
};

