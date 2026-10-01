const getNextStatus = (status) => {
    return {
        pending: "confirmed",
        confirmed: "preparing",
        preparing: "out_for_delivery",
        out_for_delivery: "delivered"
    }[status] || "";
};


const formatStatus = (status) => {
    return String(status || "")
        .replaceAll("_", " ");
};


const updateOrderStatus = async (
    orderId,
    nextStatus,
    button
) => {
    button.disabled = true;

    try {
        const response =
            await fetch(
                `${ORDER_API_URL}/${orderId}/status`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json",

                        ...getAuthHeaders()
                    },

                    body:
                        JSON.stringify({
                            status: nextStatus
                        })
                }
            );

        const result =
            await response.json();

        if (
            !response.ok ||
            !result.success
        ) {
            throw new Error(
                result.message ||
                "Unable to update order status."
            );
        }

        setMessage(
            "orders-message",
            "Order status updated successfully."
        );

        await loadOrders();

    } catch (error) {
        setMessage(
            "orders-message",
            error.message
        );

        button.disabled = false;
    }
};
