const ADMIN_ORDER_API =
    "http://localhost:5000/api/orders";

const adminOrderRequest = async (
    path,
    options = {}
) => {
    const response =
        await fetch(
            `${ADMIN_ORDER_API}${path}`,
            {
                ...options,
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                }
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
            "Order request failed."
        );
    }

    return result;
};

const getAdminOrders =
    async ({
        status = "",
        page = 1,
        limit = 20
    } = {}) => {
        const params =
            new URLSearchParams();

        params.set("page", page);
        params.set("limit", limit);

        if (status) {
            params.set("status", status);
        }

        return adminOrderRequest(
            `/admin?${params.toString()}`
        );
    };

const updateAdminOrderStatus =
    async (
        orderId,
        status
    ) => {
        return adminOrderRequest(
            `/${encodeURIComponent(orderId)}/status`,
            {
                method: "PATCH",
                body: JSON.stringify({ status })
            }
        );
    };

const assignAdminDeliveryBoy =
    async (
        orderId,
        deliveryBoyId
    ) => {
        return adminOrderRequest(
            `/${encodeURIComponent(orderId)}/assign-delivery`,
            {
                method: "PATCH",
                body: JSON.stringify({ deliveryBoyId })
            }
        );
    };

window.getAdminOrders =
    getAdminOrders;

window.updateAdminOrderStatus =
    updateAdminOrderStatus;

window.assignAdminDeliveryBoy =
    assignAdminDeliveryBoy;
