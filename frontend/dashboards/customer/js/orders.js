const ORDERS_API_URL = "http://localhost:5000/api/orders/my";

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

        const authToken = localStorage.getItem(
            "authToken"
        );

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
                    "Authorization": `Bearer ${authToken}`
                }
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
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
            <article class="order-card">
                <div class="order-card-header">
                    <div>
                        <p class="order-number">
                            Order #${order._id}
                        </p>

                        <p class="order-date">
                            ${createdAt}
                        </p>
                    </div>

                    <span class="order-status">
                        ${order.status || "pending"}
                    </span>
                </div>

                <ul class="order-items">
                    ${
                        items.map((item) => `
                            <li class="order-item">
                                <div>
                                    <p class="order-item-name">
                                        ${item.name || "Food item"}
                                    </p>

                                    <p class="order-item-quantity">
                                        Qty: ${item.quantity || 0}
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
                    <p class="order-payment">
                        Payment:
                        ${(order.paymentMethod || "").toUpperCase()}
                        ·
                        ${order.paymentStatus || "pending"}
                    </p>

                    <p class="order-total">
                        Total:
                        ₹${Number(
                            order.totalAmount || 0
                        ).toFixed(2)}
                    </p>
                </div>
            </article>
        `;
    }).join("");
};

loadCustomerOrders();
