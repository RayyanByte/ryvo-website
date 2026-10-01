const SHOP_API_URL =
    "http://localhost:5000/api/shop";

const DELIVERY_BOYS_API_URL =
    "http://localhost:5000/api/auth/admin/delivery-boys";

const ORDERS_API_URL =
    "http://localhost:5000/api/orders/admin";

const ORDER_ASSIGN_API_URL =
    "http://localhost:5000/api/orders";


const getAuthToken = () => {
    return localStorage.getItem("authToken");
};


const getAuthHeaders = () => {
    return {
        Authorization:
            `Bearer ${getAuthToken()}`
    };
};


const setMessage = (
    elementId,
    message
) => {
    const element =
        document.getElementById(elementId);

    if (element) {
        element.textContent = message;
    }
};


const updateShopBadge = (isOpen) => {
    const badge =
        document.getElementById(
            "shop-status-badge"
        );

    if (badge) {
        badge.textContent =
            isOpen ? "Open" : "Closed";
    }
};


const renderShopSettings = (shop) => {
    document.getElementById(
        "shop-is-open"
    ).value = String(shop.isOpen);

    document.getElementById(
        "shop-status-message"
    ).value = shop.statusMessage || "";

    document.getElementById(
        "shop-latitude"
    ).value =
        shop.location?.latitude ?? "";

    document.getElementById(
        "shop-longitude"
    ).value =
        shop.location?.longitude ?? "";

    document.getElementById(
        "shop-radius"
    ).value =
        shop.deliveryRadiusKm ?? "";

    updateShopBadge(shop.isOpen);
};


const loadShopSettings = async () => {
    try {
        const response =
            await fetch(SHOP_API_URL);

        const result =
            await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message ||
                "Unable to load shop settings."
            );
        }

        renderShopSettings(result.data);

    } catch (error) {
        setMessage(
            "shop-message",
            error.message
        );
    }
};


const initializeShopForm = () => {
    document
        .getElementById("shop-settings-form")
        ?.addEventListener(
            "submit",
            async (event) => {
                event.preventDefault();

                const body = {
                    isOpen:
                        document.getElementById(
                            "shop-is-open"
                        ).value === "true",

                    statusMessage:
                        document.getElementById(
                            "shop-status-message"
                        ).value.trim(),

                    location: {
                        latitude:
                            Number(
                                document.getElementById(
                                    "shop-latitude"
                                ).value
                            ),

                        longitude:
                            Number(
                                document.getElementById(
                                    "shop-longitude"
                                ).value
                            )
                    },

                    deliveryRadiusKm:
                        Number(
                            document.getElementById(
                                "shop-radius"
                            ).value
                        )
                };

                setMessage(
                    "shop-message",
                    "Saving..."
                );

                try {
                    const response =
                        await fetch(
                            SHOP_API_URL,
                            {
                                method: "PATCH",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    ...getAuthHeaders()
                                },

                                body:
                                    JSON.stringify(body)
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
                            "Unable to update shop."
                        );
                    }

                    renderShopSettings(
                        result.data
                    );

                    setMessage(
                        "shop-message",
                        "Shop settings saved."
                    );

                } catch (error) {
                    setMessage(
                        "shop-message",
                        error.message
                    );
                }
            }
        );
};


const initializeDeliveryBoyForm = () => {
    document
        .getElementById("delivery-boy-form")
        ?.addEventListener(
            "submit",
            async (event) => {
                event.preventDefault();

                const form =
                    event.currentTarget;

                const data =
                    new FormData(form);

                try {
                    const response =
                        await fetch(
                            DELIVERY_BOYS_API_URL,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    ...getAuthHeaders()
                                },

                                body:
                                    JSON.stringify({
                                        name:
                                            data
                                                .get("name")
                                                .trim(),

                                        email:
                                            data
                                                .get("email")
                                                .trim()
                                                .toLowerCase(),

                                        phone:
                                            data
                                                .get("phone")
                                                .trim(),

                                        password:
                                            data.get(
                                                "password"
                                            )
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
                            "Unable to create account."
                        );
                    }

                    form.reset();

                    setMessage(
                        "delivery-boy-message",
                        "Delivery boy account created successfully."
                    );

                    loadOrders();

                } catch (error) {
                    setMessage(
                        "delivery-boy-message",
                        error.message
                    );
                }
            }
        );
};


let deliveryBoys = [];
let currentPage = 1;
let currentStatus = "";


const escapeHtml = (value) => {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
};


const loadDeliveryBoys = async () => {
    const response =
        await fetch(
            DELIVERY_BOYS_API_URL,
            {
                headers:
                    getAuthHeaders()
            }
        );

    const result =
        await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message ||
            "Unable to load delivery boys."
        );
    }

    deliveryBoys =
        Array.isArray(result.data)
            ? result.data
            : [];
};


const deliveryOptions = (
    selectedId
) => {
    const options = [
        `<option value="">Select delivery boy</option>`
    ];

    deliveryBoys
        .filter(
            (boy) => boy.isActive
        )
        .forEach(
            (boy) => {
                const selected =
                    String(boy._id) ===
                    String(selectedId)
                        ? " selected"
                        : "";

                options.push(`
                    <option
                        value="${escapeHtml(
                            boy._id
                        )}"
                        ${selected}
                    >
                        ${escapeHtml(
                            boy.name
                        )}
                    </option>
                `);
            }
        );

    return options.join("");
};


const renderOrders = (orders) => {
    const container =
        document.getElementById(
            "orders-list"
        );

    if (!orders.length) {
        container.innerHTML =
            `<div class="no-orders">No orders found.</div>`;

        return;
    }

    container.innerHTML =
        orders.map(
            (order) => {

                const customer =
                    order.userId?.name ||
                    "Unknown";

                const phone =
                    order.userId?.phone ||
                    "-";

                const total =
                    Number(
                        order.totalAmount || 0
                    ).toFixed(2);

                const terminal =
                    [
                        "delivered",
                        "cancelled"
                    ].includes(
                        order.status
                    );

                return `
                    <article
                        class="order-admin-card"
                    >

                        <div
                            class="order-admin-header"
                        >
                            <div>
                                <p
                                    class="order-admin-id"
                                >
                                    Order
                                    ${escapeHtml(
                                        order._id
                                    )}
                                </p>

                                <p
                                    class="order-admin-date"
                                >
                                    ${escapeHtml(
                                        new Date(
                                            order.createdAt
                                        ).toLocaleString()
                                    )}
                                </p>
                            </div>

                            <span
                                class="order-status"
                            >
                                ${escapeHtml(
                                    order.status
                                )}
                            </span>
                        </div>

                        <div
                            class="order-admin-details"
                        >
                            <p
                                class="order-admin-detail"
                            >
                                <strong>
                                    Customer:
                                </strong>
                                ${escapeHtml(
                                    customer
                                )}
                            </p>

                            <p
                                class="order-admin-detail"
                            >
                                <strong>
                                    Phone:
                                </strong>
                                ${escapeHtml(
                                    phone
                                )}
                            </p>

                            <p
                                class="order-admin-detail"
                            >
                                <strong>
                                    Total:
                                </strong>
                                ₹${escapeHtml(
                                    total
                                )}
                            </p>

                            <p
                                class="order-admin-detail"
                            >
                                <strong>
                                    Payment:
                                </strong>
                                ${escapeHtml(
                                    order.paymentMethod
                                )}
                            </p>

                            <p
                                class="order-admin-detail"
                            >
                                <strong>
                                    Delivery:
                                </strong>
                                ${escapeHtml(
                                    order.deliveryBoyId?.name ||
                                    "Not assigned"
                                )}
                            </p>
                        </div>

                        ${
                            terminal
                                ? ""
                                : `
                                    <div
                                        class="order-assignment"
                                    >
                                        <select
                                            class="delivery-select"
                                            data-order-id="${escapeHtml(
                                                order._id
                                            )}"
                                        >
                                            ${deliveryOptions(
                                                order
                                                    .deliveryBoyId
                                                    ?._id
                                            )}
                                        </select>

                                        <button
                                            type="button"
                                            class="assign-button"
                                            data-order-id="${escapeHtml(
                                                order._id
                                            )}"
                                        >
                                            Assign
                                        </button>
                                    </div>
                                `
                        }

                    </article>
                `;
            }
        ).join("");
};


const renderPagination = (
    page,
    totalPages
) => {
    const container =
        document.getElementById(
            "orders-pagination"
        );

    if (totalPages <= 1) {
        container.innerHTML = "";

        return;
    }

    container.innerHTML = `
        <button
            type="button"
            class="pagination-button"
            id="orders-previous"
            ${page <= 1 ? "disabled" : ""}
        >
            Previous
        </button>

        <button
            type="button"
            class="pagination-button"
            id="orders-next"
            ${page >= totalPages ? "disabled" : ""}
        >
            Next
        </button>
    `;

    document
        .getElementById("orders-previous")
        ?.addEventListener(
            "click",
            () => {
                currentPage -= 1;
                loadOrders();
            }
        );

    document
        .getElementById("orders-next")
        ?.addEventListener(
            "click",
            () => {
                currentPage += 1;
                loadOrders();
            }
        );
};


const loadOrders = async () => {
    try {
        setMessage(
            "orders-message",
            "Loading orders..."
        );

        await loadDeliveryBoys();

        const params =
            new URLSearchParams({
                page:
                    String(currentPage),

                limit: "10"
            });

        if (currentStatus) {
            params.set(
                "status",
                currentStatus
            );
        }

        const response =
            await fetch(
                `${ORDERS_API_URL}?${params}`,
                {
                    headers:
                        getAuthHeaders()
                }
            );

        const result =
            await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message ||
                "Unable to load orders."
            );
        }

        renderOrders(
            result.data || []
        );

        renderPagination(
            result.page,
            result.totalPages
        );

        setMessage(
            "orders-message",
            result.totalOrders
                ? `Total orders: ${result.totalOrders}`
                : ""
        );

    } catch (error) {
        setMessage(
            "orders-message",
            error.message
        );
    }
};


const assignDeliveryBoy = async (
    orderId,
    deliveryBoyId,
    button
) => {
    if (!deliveryBoyId) {
        setMessage(
            "orders-message",
            "Please select a delivery boy."
        );

        return;
    }

    button.disabled = true;

    try {
        const response =
            await fetch(
                `${ORDER_ASSIGN_API_URL}/${orderId}/assign-delivery`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json",

                        ...getAuthHeaders()
                    },

                    body:
                        JSON.stringify({
                            deliveryBoyId
                        })
                }
            );

        const result =
            await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message ||
                "Unable to assign delivery boy."
            );
        }

        setMessage(
            "orders-message",
            "Delivery boy assigned successfully."
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


const initializeOrderManagement = () => {

    document
        .getElementById(
            "order-status-filter"
        )
        ?.addEventListener(
            "change",
            (event) => {
                currentStatus =
                    event.target.value;

                currentPage = 1;

                loadOrders();
            }
        );

    document
        .getElementById(
            "refresh-orders-button"
        )
        ?.addEventListener(
            "click",
            loadOrders
        );

    document
        .getElementById(
            "orders-list"
        )
        ?.addEventListener(
            "click",
            (event) => {

                const button =
                    event.target.closest(
                        ".assign-button"
                    );

                if (!button) {
                    return;
                }

                const orderId =
                    button.dataset.orderId;

                const select =
                    document.querySelector(
                        `.delivery-select[data-order-id="${orderId}"]`
                    );

                if (!select) {
                    return;
                }

                assignDeliveryBoy(
                    orderId,
                    select.value,
                    button
                );
            }
        );

    loadOrders();
};


const initializeAdminDashboard = () => {
    if (!getAuthToken()) {
        setMessage(
            "shop-message",
            "Please sign in as admin."
        );

        setMessage(
            "delivery-boy-message",
            "Please sign in as admin."
        );

        return;
    }

    initializeShopForm();
    initializeDeliveryBoyForm();
    initializeOrderManagement();
    loadShopSettings();
};


initializeAdminDashboard();
