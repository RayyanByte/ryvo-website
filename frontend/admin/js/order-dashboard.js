const loadAdminOrderDashboard =
    async () => {
        const list =
            document.getElementById(
                "admin-order-list"
            );

        const message =
            document.getElementById(
                "admin-order-message"
            );

        if (!list) {
            return;
        }

        const status =
            document.getElementById(
                "order-status-filter"
            )?.value || "";

        try {
            if (message) {
                message.textContent =
                    "Loading orders...";
            }

            const [
                orderResult,
                deliveryResult
            ] = await Promise.all([
                window.getAdminOrders({
                    status
                }),

                window.getAdminDeliveryBoys()
            ]);

            const orders =
                orderResult?.data || [];

            const deliveryBoys =
                deliveryResult?.data || [];

            if (!orders.length) {
                list.innerHTML =
                    "<p>No orders found.</p>";

                if (message) {
                    message.textContent =
                        "";
                }

                return;
            }

            list.innerHTML =
                orders
                    .map(
                        (order) => {
                            const canConfirm =
                                order.status ===
                                    "pending" &&
                                Boolean(
                                    order.deliveryBoyId
                                );

                            const canPrepare =
                                order.status ===
                                "confirmed";

                            const canOut =
                                order.status ===
                                "preparing";

                            const canCancel =
                                order.status ===
                                "pending";

                            return `
                                <article
                                    class="admin-order-card"
                                    data-order-id="${order._id}"
                                >
                                    <h3>
                                        Order #${order.orderNumber || order._id}
                                    </h3>

                                    <p>
                                        Customer:
                                        ${order.userId?.name || "-"}
                                    </p>

                                    <p>
                                        Phone:
                                        ${order.userId?.phone || "-"}
                                    </p>

                                    <p>
                                        Total:
                                        ₹${Number(
                                            order.totalAmount || 0
                                        ).toFixed(2)}
                                    </p>

                                    <p>
                                        Payment:
                                        ${String(
                                            order.paymentMethod || ""
                                        ).toUpperCase()}
                                        /
                                        ${order.paymentStatus}
                                    </p>

                                    <p>
                                        Status:
                                        ${order.status}
                                    </p>

                                    <p>
                                        Delivery:
                                        ${
                                            order.deliveryBoyId?.name ||
                                            "Not assigned"
                                        }
                                    </p>

                                    <label>
                                        Assign Delivery Boy
                                        <select
                                            onchange="assignDeliveryFromDashboard(
                                                '${order._id}',
                                                this.value
                                            )"
                                        >
                                            <option value="">
                                                Select
                                            </option>

                                            ${deliveryBoys
                                                .map(
                                                    (boy) => `
                                                        <option
                                                            value="${boy._id}"
                                                            ${
                                                                order
                                                                    .deliveryBoyId
                                                                    ?._id ===
                                                                boy._id
                                                                    ? "selected"
                                                                    : ""
                                                            }
                                                        >
                                                            ${boy.name}
                                                        </option>
                                                    `
                                                )
                                                .join("")}
                                        </select>
                                    </label>

                                    <div
                                        class="admin-order-actions"
                                    >
                                        ${
                                            canConfirm
                                                ? `
                                                    <button
                                                        type="button"
                                                        onclick="changeAdminOrderStatus(
                                                            '${order._id}',
                                                            'confirmed'
                                                        )"
                                                    >
                                                        Confirm
                                                    </button>
                                                `
                                                : ""
                                        }

                                        ${
                                            canPrepare
                                                ? `
                                                    <button
                                                        type="button"
                                                        onclick="changeAdminOrderStatus(
                                                            '${order._id}',
                                                            'preparing'
                                                        )"
                                                    >
                                                        Preparing
                                                    </button>
                                                `
                                                : ""
                                        }

                                        ${
                                            canOut
                                                ? `
                                                    <button
                                                        type="button"
                                                        onclick="changeAdminOrderStatus(
                                                            '${order._id}',
                                                            'out_for_delivery'
                                                        )"
                                                    >
                                                        Out for Delivery
                                                    </button>
                                                `
                                                : ""
                                        }

                                        ${
                                            canCancel
                                                ? `
                                                    <button
                                                        type="button"
                                                        onclick="changeAdminOrderStatus(
                                                            '${order._id}',
                                                            'cancelled'
                                                        )"
                                                    >
                                                        Cancel
                                                    </button>
                                                `
                                                : ""
                                        }
                                    </div>
                                </article>
                            `;
                        }
                    )
                    .join("");

            if (message) {
                message.textContent =
                    "";
            }

        } catch (error) {
            if (message) {
                message.textContent =
                    error.message;
            }
        }
    };


const changeAdminOrderStatus =
    async (
        orderId,
        status
    ) => {
        try {
            await window.updateAdminOrderStatus(
                orderId,
                status
            );

            await loadAdminOrderDashboard();

        } catch (error) {
            alert(
                error.message
            );
        }
    };


const assignDeliveryFromDashboard =
    async (
        orderId,
        deliveryBoyId
    ) => {
        if (!deliveryBoyId) {
            return;
        }

        try {
            await window.assignAdminDeliveryBoy(
                orderId,
                deliveryBoyId
            );

            await loadAdminOrderDashboard();

        } catch (error) {
            alert(
                error.message
            );
        }
    };


const initializeAdminOrderDashboard =
    () => {
        document
            .getElementById(
                "load-orders-button"
            )
            ?.addEventListener(
                "click",
                loadAdminOrderDashboard
            );

        loadAdminOrderDashboard();
    };


window.changeAdminOrderStatus =
    changeAdminOrderStatus;

window.assignDeliveryFromDashboard =
    assignDeliveryFromDashboard;


if (
    document.readyState ===
    "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        initializeAdminOrderDashboard
    );
} else {
    initializeAdminOrderDashboard();
}


window.initializeAdminOrderDashboard = initializeAdminOrderDashboard;
