const ORDERS_API_URL =
    "http://localhost:5000/api/orders/my";

const ORDER_API_URL =
    "http://localhost:5000/api/orders/";

const escapeHtml = (value) => {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
};


const loadCustomerOrders = async () => {
    const container = document.querySelector(
        "[data-customer-orders]"
    );

    if (!container) {
        return;
    }

    try {
        const componentResponse = await fetch(
            "../components/orders.html"
        );

        if (!componentResponse.ok) {
            throw new Error(
                "Could not load orders component."
            );
        }

        container.innerHTML =
            await componentResponse.text();

        const list = document.getElementById(
            "customer-orders-list"
        );

        if (!list) {
            return;
        }

        const authToken =
            localStorage.getItem("authToken");

        if (!authToken) {
            list.innerHTML = `
                <p class="orders-message">
                    Please sign in to view your orders.
                </p>
            `;

            return;
        }

        const response = await fetch(
            ORDERS_API_URL,
            {
                method: "GET",
                headers: {
                    Authorization:
                        `Bearer ${authToken}`
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
                "Could not load your orders."
            );
        }

        renderCustomerOrders(
            result.data || []
        );
    } catch (error) {
        console.error(
            "Customer orders error:",
            error
        );

        const list = document.getElementById(
            "customer-orders-list"
        );

        if (list) {
            list.innerHTML = `
                <p class="orders-message">
                    Unable to load your orders. Please try again.
                </p>
            `;
        }
    }
};

const renderCustomerOrders = (orders) => {
    const list = document.getElementById(
        "customer-orders-list"
    );

    if (!list) {
        return;
    }

    if (!orders.length) {
        list.innerHTML = `
            <p class="orders-message">
                You have not placed any orders yet.
            </p>
        `;

        return;
    }

    list.innerHTML = orders.map((order) => {
        const createdAt = order.createdAt
            ? new Date(
                order.createdAt
            ).toLocaleString()
            : "Date unavailable";

        const items = Array.isArray(order.items)
            ? order.items
            : [];

        return `
            <article
                class="order-card"
                data-order-id="${escapeHtml(order._id)}"
            >
                <div class="order-card-header">
                    <div>
                        <p class="order-number">
                            Order #${escapeHtml(order._id)}
                        </p>

                        <p class="order-date">
                            ${escapeHtml(createdAt)}
                        </p>
                    </div>

                    <span class="order-status">
                        ${escapeHtml(order.status || "pending")}
                    </span>
                </div>

                <ul class="order-items">
                    ${
                        items.map((item) => `
                            <li class="order-item">
                                <div>
                                    <p class="order-item-name">
                                        ${escapeHtml(item.name || "Food item")}
                                    </p>

                                    <p class="order-item-quantity">
                                        Qty: ${escapeHtml(item.quantity || 0)}
                                    </p>
                                </div>

                                <span class="order-item-total">
                                    ₹${Number(
                                        item.total || 0
                                    ).toFixed(2)}
                                </span>
                            </li>
                        `).join("")
                    }
                </ul>

                <div class="order-card-footer">
                    <div>
                        <p class="order-payment">
                            Payment:
                            ${(order.paymentMethod || "").toUpperCase()}
                            ·
                            ${escapeHtml(order.paymentStatus || "pending")}
                        </p>

                        <p class="order-total">
                            Total:
                            ₹${Number(
                                order.totalAmount || 0
                            ).toFixed(2)}
                        </p>
                    </div>

                    <div class="order-actions">
                        <button
                            type="button"
                            class="order-details-button"
                            data-order-details="${escapeHtml(order._id)}"
                        >
                            View Details
                        </button>

                        ${
                            order.status === "pending"
                                ? `
                                    <button
                                        type="button"
                                        class="order-cancel-button"
                                        data-order-cancel="${escapeHtml(order._id)}"
                                    >
                                        Cancel Order
                                    </button>
                                `
                                : ""
                        }
                    </div>
                </div>

                <div
                    class="order-details"
                    data-order-details-container="${escapeHtml(order._id)}"
                    hidden
                ></div>
            </article>
        `;
    }).join("");

    bindOrderActions();
};

const bindOrderActions = () => {
    document
        .querySelectorAll("[data-order-details]")
        .forEach((button) => {
            button.addEventListener(
                "click",
                async () => {
                    await toggleOrderDetails(
                        button.dataset.orderDetails,
                        button
                    );
                }
            );
        });

    document
        .querySelectorAll("[data-order-cancel]")
        .forEach((button) => {
            button.addEventListener(
                "click",
                async () => {
                    await cancelCustomerOrder(
                        button.dataset.orderCancel,
                        button
                    );
                }
            );
        });
};

const toggleOrderDetails = async (
    orderId,
    button
) => {
    const container =
        document.querySelector(
            `[data-order-details-container="${orderId}"]`
        );

    if (!container) {
        return;
    }

    if (!container.hidden) {
        container.hidden = true;
        button.textContent =
            "View Details";

        return;
    }

    const authToken =
        localStorage.getItem("authToken");

    if (!authToken) {
        return;
    }

    button.disabled = true;
    button.textContent = "Loading...";

    try {
        const response = await fetch(
            `${ORDER_API_URL}${orderId}`,
            {
                method: "GET",
                headers: {
                    Authorization:
                        `Bearer ${authToken}`
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
                "Could not load order details."
            );
        }

        renderOrderDetails(
            container,
            result.data
        );

        container.hidden = false;
        button.textContent =
            "Hide Details";
    } catch (error) {
        console.error(
            "Order details error:",
            error
        );

        container.innerHTML = `
            <p class="orders-message">
                Unable to load order details.
            </p>
        `;

        container.hidden = false;
        button.textContent =
            "Hide Details";
    } finally {
        button.disabled = false;
    }
};

const renderOrderDetails = (
    container,
    order
) => {
    const location =
        order.deliveryLocation;

    const address =
        order.addressId;

    container.innerHTML = `
        <div class="order-details-content">
            <h3>
                Order Details
            </h3>

            <div class="order-detail-grid">
                <div>
                    <span>
                        Order Status
                    </span>

                    <strong>
                        ${escapeHtml(order.status || "pending")}
                    </strong>
                </div>

                <div>
                    <span>
                        Payment
                    </span>

                    <strong>
                        ${(order.paymentMethod || "").toUpperCase()}
                        ·
                        ${escapeHtml(order.paymentStatus || "pending")}
                    </strong>
                </div>

                <div>
                    <span>
                        Delivery Distance
                    </span>

                    <strong>
                        ${Number(
                            location?.distanceKm || 0
                        ).toFixed(2)} km
                    </strong>
                </div>

                <div>
                    <span>
                        Location Source
                    </span>

                    <strong>
                        ${location?.source || "Not available"}
                    </strong>
                </div>
            </div>

            ${
                address
                    ? `
                        <div class="order-address">
                            <h4>
                                Delivery Address
                            </h4>

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
                                -
                                ${address.pincode || ""}
                            </p>

                            <p>
                                ${address.phone || ""}
                            </p>
                        </div>
                    `
                    : ""
            }

            <p class="order-location-coordinates">
                Delivery coordinates:
                ${location?.latitude ?? "N/A"},
                ${location?.longitude ?? "N/A"}
            </p>
        </div>
    `;
};

const cancelCustomerOrder = async (
    orderId,
    button
) => {
    const confirmed =
        window.confirm(
            "Are you sure you want to cancel this order?"
        );

    if (!confirmed) {
        return;
    }

    const authToken =
        localStorage.getItem("authToken");

    if (!authToken) {
        window.alert(
            "Please sign in first."
        );

        return;
    }

    button.disabled = true;
    button.textContent =
        "Cancelling...";

    try {
        const response = await fetch(
            `${ORDER_API_URL}${orderId}/cancel`,
            {
                method: "PATCH",
                headers: {
                    Authorization:
                        `Bearer ${authToken}`
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
                "Failed to cancel order."
            );
        }

        await loadCustomerOrders();
    } catch (error) {
        console.error(
            "Cancel order error:",
            error
        );

        window.alert(
            error.message ||
            "Unable to cancel order."
        );

        button.disabled = false;
        button.textContent =
            "Cancel Order";
    }
};

loadCustomerOrders();
