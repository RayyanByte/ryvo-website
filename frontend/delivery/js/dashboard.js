const DELIVERY_ORDERS_API_URL =
    "http://localhost:5000/api/orders/delivery/my";

const DELIVERY_STATUS_API_URL =
    "http://localhost:5000/api/orders";


const getAuthToken = () => {
    return localStorage.getItem("authToken");
};


const formatDate = (dateValue) => {
    if (!dateValue) {
        return "Date unavailable";
    }

    return new Date(dateValue).toLocaleString();
};


const formatStatus = (status) => {
    if (!status) {
        return "Pending";
    }

    return status.replaceAll("_", " ");
};


const getNextStatus = (status) => {
    const nextStatuses = {
        confirmed: "preparing",
        preparing: "out_for_delivery",
        out_for_delivery: "delivered"
    };

    return nextStatuses[status] || null;
};


const getStatusButtonText = (status) => {
    const buttonTexts = {
        confirmed: "Start Preparing",
        preparing: "Start Delivery",
        out_for_delivery: "Mark Delivered"
    };

    return buttonTexts[status] || "";
};


const renderStatusAction = (order) => {
    const nextStatus =
        getNextStatus(order.status);

    if (!nextStatus) {
        return "";
    }

    return `
        <button
            type="button"
            class="delivery-status-button"
            data-action="update-status"
            data-order-id="${order._id}"
            data-next-status="${nextStatus}"
        >
            ${getStatusButtonText(order.status)}
        </button>
    `;
};


const renderDeliveryOrders = (orders) => {
    const container =
        document.getElementById(
            "delivery-orders"
        );

    if (!container) {
        return;
    }

    if (!orders.length) {
        container.innerHTML = `
            <p class="delivery-message">
                No assigned orders right now.
            </p>
        `;

        return;
    }

    container.innerHTML = orders.map((order) => {
        const address =
            order.addressId || {};

        const customer =
            order.userId || {};

        const items =
            Array.isArray(order.items)
                ? order.items
                : [];

        const location =
            order.deliveryLocation || {};

        return `
            <article
                class="delivery-order-card"
                data-order-id="${order._id}"
            >
                <header class="delivery-order-header">
                    <div>
                        <p class="delivery-order-id">
                            Order #${order._id}
                        </p>

                        <p class="delivery-order-date">
                            ${formatDate(order.createdAt)}
                        </p>
                    </div>

                    <span class="delivery-order-status">
                        ${formatStatus(order.status)}
                    </span>
                </header>

                <section class="delivery-section">
                    <h2>
                        Customer
                    </h2>

                    <p>
                        ${customer.name || address.fullName || "Customer"}
                    </p>

                    <p>
                        ${customer.phone || address.phone || "Phone unavailable"}
                    </p>
                </section>

                <section class="delivery-section">
                    <h2>
                        Delivery Address
                    </h2>

                    <p>
                        ${address.fullName || ""}
                    </p>

                    <p>
                        ${address.addressLine || ""}
                    </p>

                    ${
                        address.landmark
                            ? `<p>${address.landmark}</p>`
                            : ""
                    }

                    <p>
                        ${address.city || ""},
                        ${address.state || ""}
                        - ${address.pincode || ""}
                    </p>
                </section>

                <section class="delivery-section">
                    <h2>
                        Order Items
                    </h2>

                    <ul class="delivery-items">
                        ${
                            items.map((item) => `
                                <li class="delivery-item">
                                    <span>
                                        <span class="delivery-item-name">
                                            ${item.name || "Food item"}
                                        </span>

                                        × ${item.quantity || 0}
                                    </span>

                                    <span class="delivery-item-total">
                                        ₹${Number(
                                            item.total || 0
                                        ).toFixed(2)}
                                    </span>
                                </li>
                            `).join("")
                        }
                    </ul>
                </section>

                <footer class="delivery-order-footer">
                    <div>
                        <p class="delivery-total">
                            Total:
                            ₹${Number(
                                order.totalAmount || 0
                            ).toFixed(2)}
                        </p>

                        <p class="delivery-distance">
                            Distance:
                            ${Number(
                                location.distanceKm || 0
                            ).toFixed(2)} km
                        </p>
                    </div>

                    <div>
                        <p class="delivery-distance">
                            Payment:
                            ${(order.paymentMethod || "").toUpperCase()}
                        </p>

                        <p class="delivery-distance">
                            ${order.paymentStatus || "pending"}
                        </p>
                    </div>
                </footer>

                ${
                    renderStatusAction(order)
                        ? `
                            <div class="delivery-order-actions">
                                ${renderStatusAction(order)}
                            </div>
                        `
                        : ""
                }
            </article>
        `;
    }).join("");
};


const updateDeliveryOrderStatus = async (
    orderId,
    nextStatus
) => {
    const token =
        getAuthToken();

    if (!token) {
        return;
    }

    try {
        const response =
            await fetch(
                `${DELIVERY_STATUS_API_URL}/${orderId}/delivery-status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
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

        await loadDeliveryOrders();
    } catch (error) {
        console.error(
            "Delivery status update error:",
            error
        );

        alert(
            error.message ||
            "Unable to update order status."
        );
    }
};


const loadDeliveryOrders = async () => {
    const container =
        document.getElementById(
            "delivery-orders"
        );

    if (!container) {
        return;
    }

    const token =
        getAuthToken();

    if (!token) {
        container.innerHTML = `
            <p class="delivery-message">
                Please sign in to view assigned orders.
            </p>
        `;

        return;
    }

    try {
        const response =
            await fetch(
                DELIVERY_ORDERS_API_URL,
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
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
                "Unable to load assigned orders."
            );
        }

        renderDeliveryOrders(
            result.data || []
        );
    } catch (error) {
        console.error(
            "Delivery dashboard error:",
            error
        );

        container.innerHTML = `
            <p class="delivery-message">
                Unable to load assigned orders.
                Please try again.
            </p>
        `;
    }
};


document.addEventListener(
    "click",
    (event) => {
        const button =
            event.target.closest(
                '[data-action="update-status"]'
            );

        if (!button) {
            return;
        }

        const orderId =
            button.dataset.orderId;

        const nextStatus =
            button.dataset.nextStatus;

        if (
            !orderId ||
            !nextStatus
        ) {
            return;
        }

        updateDeliveryOrderStatus(
            orderId,
            nextStatus
        );
    }
);


loadDeliveryOrders();
