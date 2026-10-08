const ORDER_API_URL =
    "http://localhost:5000/api/orders/";

const PAYMENT_API_URL =
    "http://localhost:5000/api/payments/";

let isOrderSubmitting = false;


const getReviewElement = (id) => {
    return document.getElementById(id);
};


const escapeHtml = (value) => {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
};


const showReviewMessage = (
    message,
    type = ""
) => {
    const element =
        getReviewElement(
            "order-review-message"
        );

    if (!element) {
        return;
    }

    element.textContent =
        message;

    element.className =
        `order-review-message ${type}`.trim();
};


const getOrderData = () => {
    const orderItem =
        typeof window.getSelectedOrderItem ===
        "function"
            ? window.getSelectedOrderItem()
            : null;

    const deliveryLocation =
        typeof window.getOrderDeliveryLocation ===
        "function"
            ? window.getOrderDeliveryLocation()
            : null;

    const selectedAddress =
        typeof window.getSelectedOrderAddress ===
        "function"
            ? window.getSelectedOrderAddress()
            : null;

    const deliveryAddress =
        selectedAddress ||
        (window.orderDeliveryAddress
            ? { ...window.orderDeliveryAddress }
            : null);

    const paymentMethod =
        typeof window.getSelectedPaymentMethod ===
        "function"
            ? window.getSelectedPaymentMethod()
            : null;

    return {
        orderItem,
        deliveryLocation,
        deliveryAddress,
        paymentMethod
    };
};


const validateOrderData = ({
    orderItem,
    deliveryLocation,
    deliveryAddress,
    paymentMethod
}) => {
    if (
        !orderItem ||
        !deliveryLocation ||
        !deliveryAddress ||
        !paymentMethod
    ) {
        return false;
    }

    const price =
        Number(orderItem.price);

    const quantity =
        Number(orderItem.quantity);

    const latitude =
        Number(
            deliveryLocation.latitude
        );

    const longitude =
        Number(
            deliveryLocation.longitude
        );

    return (
        Number.isFinite(price) &&
        price >= 0 &&
        Number.isInteger(quantity) &&
        quantity >= 1 &&
        Number.isFinite(latitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        Number.isFinite(longitude) &&
        longitude >= -180 &&
        longitude <= 180 &&
        Boolean(
            deliveryAddress._id
        ) &&
        Boolean(
            orderItem.foodId
        ) &&
        ["gps", "map", "search", "address"].includes(
            deliveryLocation.source
        ) &&
        ["cod", "upi"].includes(
            paymentMethod
        )
    );
};


const renderOrderReview = () => {
    const contentElement =
        getReviewElement(
            "order-review-content"
        );

    const placeButton =
        getReviewElement(
            "place-order-button"
        );

    if (
        !contentElement ||
        !placeButton
    ) {
        return;
    }

    const orderData =
        getOrderData();

    if (
        !validateOrderData(
            orderData
        )
    ) {
        contentElement.innerHTML = `
            <p class="order-review-message">
                Please complete all order details before placing your order.
            </p>
        `;

        placeButton.disabled = true;
        return;
    }

    const {
        orderItem,
        deliveryLocation,
        deliveryAddress,
        paymentMethod
    } = orderData;

    const price =
        Number(orderItem.price);

    const quantity =
        Number(orderItem.quantity);

    const total =
        price * quantity;

    const paymentLabel =
        paymentMethod === "cod"
            ? "Cash on Delivery"
            : "UPI";

    contentElement.innerHTML = `
        <div class="order-review-row">
            <span>Food</span>
            <strong>
                ${escapeHtml(orderItem.name)}
            </strong>
        </div>

        <div class="order-review-row">
            <span>Quantity</span>
            <strong>
                ${escapeHtml(quantity)}
            </strong>
        </div>

        <div class="order-review-row">
            <span>Price</span>
            <strong>
                ₹${price.toFixed(2)}
            </strong>
        </div>

        <div class="order-review-row">
            <span>Delivery Address</span>
            <strong>
                ${escapeHtml(
                    deliveryAddress.label ||
                    "Selected address"
                )}
            </strong>
        </div>

        <div class="order-review-row">
            <span>Delivery Location</span>
            <strong>
                ${Number(
                    deliveryLocation.latitude
                ).toFixed(6)},
                ${Number(
                    deliveryLocation.longitude
                ).toFixed(6)}
            </strong>
        </div>

        <div class="order-review-row">
            <span>Distance</span>
            <strong>
                ${Number(
                    deliveryLocation.distanceKm || 0
                ).toFixed(2)} km
            </strong>
        </div>

        <div class="order-review-row">
            <span>Payment</span>
            <strong>
                ${paymentLabel}
            </strong>
        </div>

        <div class="order-review-row order-review-total">
            <span>Total</span>
            <strong>
                ₹${total.toFixed(2)}
            </strong>
        </div>
    `;

    placeButton.disabled = false;

    showReviewMessage("");
};


const clearCompletedOrderState = () => {
    window.clearSelectedOrderItem?.();
    window.clearOrderDeliveryLocation?.();
    window.clearSelectedOrderAddress?.();
    window.clearSelectedPaymentMethod?.();
};


const createPaymentRecord = async (
    orderId,
    paymentMethod,
    token
) => {
    const response =
        await fetch(
            PAYMENT_API_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`
                },

                body:
                    JSON.stringify({
                        orderId,
                        paymentMethod
                    })
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
            "Unable to create payment record."
        );
    }

    return (
        result?.data ||
        result?.payment ||
        result
    );
};


const showOrderSuccess = (
    order,
    payment
) => {
    const contentElement =
        getReviewElement(
            "order-review-content"
        );

    const placeButton =
        getReviewElement(
            "place-order-button"
        );

    if (
        !contentElement ||
        !placeButton
    ) {
        return;
    }

    const orderId =
        order?._id ||
        order?.id ||
        order?.orderId ||
        "Created successfully";

    const paymentId =
        payment?._id ||
        payment?.id ||
        "Created successfully";

    contentElement.innerHTML = `
        <div class="order-review-success">
            <h3>
                Order Placed Successfully
            </h3>

            <p>
                Your order has been placed successfully.
            </p>

            <div class="order-review-row">
                <span>Order ID</span>
                <strong>
                    ${escapeHtml(orderId)}
                </strong>
            </div>

            <div class="order-review-row">
                <span>Payment Record</span>
                <strong>
                    ${escapeHtml(paymentId)}
                </strong>
            </div>
        </div>
    `;

    placeButton.disabled = true;
    placeButton.hidden = true;

    showReviewMessage(
        "Your order and payment record have been created successfully.",
        "success"
    );

    clearCompletedOrderState();

    isOrderSubmitting = false;

    window.dispatchEvent(
        new CustomEvent(
            "orderCreated",
            {
                detail: {
                    order,
                    orderId,
                    payment,
                    paymentId
                }
            }
        )
    );
};


const placeOrder = async () => {
    if (isOrderSubmitting) {
        return;
    }

    const token =
        localStorage.getItem(
            "authToken"
        );

    if (!token) {
        showReviewMessage(
            "Please login before placing your order.",
            "error"
        );
        return;
    }

    const orderData =
        getOrderData();

    if (
        !validateOrderData(
            orderData
        )
    ) {
        showReviewMessage(
            "Please complete all order details first.",
            "error"
        );
        return;
    }

    const {
        orderItem,
        deliveryLocation,
        deliveryAddress,
        paymentMethod
    } = orderData;

    const placeButton =
        getReviewElement(
            "place-order-button"
        );

    isOrderSubmitting = true;

    if (placeButton) {
        placeButton.disabled = true;
        placeButton.textContent =
            "Placing Order...";
    }

    showReviewMessage(
        "Placing your order..."
    );

    const requestBody = {
        addressId:
            deliveryAddress._id,

        deliveryLocation: {
            latitude:
                Number(
                    deliveryLocation.latitude
                ),

            longitude:
                Number(
                    deliveryLocation.longitude
                ),

            source:
                deliveryLocation.source,

            isApproximate:
                Boolean(
                    deliveryLocation.isApproximate
                )
        },

        items: [
            {
                foodId:
                    orderItem.foodId,

                quantity:
                    Number(
                        orderItem.quantity
                    )
            }
        ],

        paymentMethod
    };

    try {
        const orderResponse =
            await fetch(
                ORDER_API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify(
                            requestBody
                        )
                }
            );

        let orderResult = null;

        try {
            orderResult =
                await orderResponse.json();
        } catch {
            orderResult = null;
        }

        if (!orderResponse.ok) {
            throw new Error(
                orderResult?.message ||
                "Unable to place the order."
            );
        }

        const order =
            orderResult?.data ||
            orderResult?.order ||
            orderResult;

        const orderId =
            order?._id ||
            order?.id ||
            order?.orderId;

        if (!orderId) {
            throw new Error(
                "Order was created but no order ID was returned."
            );
        }

        showReviewMessage(
            "Order created. Creating payment record..."
        );

        const payment =
            await createPaymentRecord(
                orderId,
                paymentMethod,
                token
            );

        showOrderSuccess(
            order,
            payment
        );
    } catch (error) {
        console.error(
            "Place order error:",
            error
        );

        showReviewMessage(
            error.message ||
            "Unable to place the order. Please try again.",
            "error"
        );

        if (placeButton) {
            placeButton.disabled = false;
            placeButton.textContent =
                "Place Order";
        }

        isOrderSubmitting = false;
    }
};


const initializeOrderReview = () => {
    const placeButton =
        getReviewElement(
            "place-order-button"
        );

    if (placeButton) {
        placeButton.addEventListener(
            "click",
            placeOrder
        );
    }

    renderOrderReview();
};


window.addEventListener(
    "orderPaymentConfirmed",
    renderOrderReview
);

window.addEventListener(
    "orderAddressConfirmed",
    renderOrderReview
);

window.addEventListener(
    "deliveryAreaConfirmed",
    renderOrderReview
);


if (
    document.readyState ===
    "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        initializeOrderReview
    );
} else {
    initializeOrderReview();
}
