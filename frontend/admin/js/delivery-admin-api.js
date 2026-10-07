const ADMIN_DELIVERY_API =
    "http://localhost:5000/api/delivery/admin";


const getAdminDeliveryBoys =
    async () => {
        const token =
            localStorage.getItem(
                "authToken"
            );

        if (!token) {
            throw new Error(
                "Admin login required."
            );
        }

        const response =
            await fetch(
                ADMIN_DELIVERY_API,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        let result = null;

        try {
            result =
                await response.json();
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
