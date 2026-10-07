const ADMIN_DELIVERY_API =
    "http://localhost:5000/api/delivery/admin";

const getAdminDeliveryBoys =
    async () => {
        const response =
            await fetch(
                ADMIN_DELIVERY_API,
                {
                    credentials: "include"
                }
            );

        let result = null;

        try {
            result = await response.json();
        } catch {
            result = null;
        }

        if (!response.ok) {
            throw new Error(
                result?.message ||
                "Unable to fetch delivery boys."
            );
        }

        return result;
    };

window.getAdminDeliveryBoys =
    getAdminDeliveryBoys;
