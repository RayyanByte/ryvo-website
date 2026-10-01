const ORDER_API_URL =
    "http://localhost:5000/api/orders/";

const PAYMENT_API_URL =
    "http://localhost:5000/api/payments/";

let isOrderSubmitting = false;


const getReviewElement = (id) => {
    return document.getElementById(id);
};


const showReviewMessage = (
    message,
    type = ""
) => {

    const messageElement =
        getReviewElement(
            "order-review-message"
        );

    if (!messageElement) {
        return;
    }

    messageElement.textContent =
        message;

    messageElement.className =
        `order-review-message ${type}`.trim();
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


    const deliveryAddress =
        typeof window.getSelectedOrderAddress ===
        "function"
            ? window.getSelectedOrderAddress()
            : null;


    const paymentMethod =
        typeof window.getSelectedPaymentMethod ===
        "function"
            ? window.getSelectedPaymentMethod()
            : null;


    if (
        !orderItem ||
        !deliveryLocation ||
        !deliveryAddress ||
        !paymentMethod
    ) {

        contentElement.innerHTML = `
            <p class="order-review-message">
                Please complete all order details before placing your order.
            </p>
        `;

        placeButton.disabled = true;

        return;
    }


    const total =
        Number(orderItem.price) *
        Number(orderItem.quantity);


    const paymentLabel =
        paymentMethod === "cod"
            ? "Cash on Delivery"
            : "UPI";


    contentElement.innerHTML = `
        <div class="order-review-row">
            <span>Food</span>
            <strong>${orderItem.name}</strong>
        </div>

        <div class="order-review-row">
            <span>Quantity</span>
            <strong>${orderItem.quantity}</strong>
        </div>

        <div class="order-review-row">
            <span>Price</span>
            <strong>₹${Number(orderItem.price).toFixed(2)}</strong>
        </div>

        <div class="order-review-row">
            <span>Delivery Address</span>
            <strong>
                ${deliveryAddress.label || "Selected address"}
            </strong>
        </div>

        <div class="order-review-row">
            <span>Delivery Location</span>
            <strong>
                ${Number(deliveryLocation.latitude).toFixed(6)},
                ${Number(deliveryLocation.longitude).toFixed(6)}
            </strong>
        </div>

        <div class="order-review-row">
            <span>Distance</span>
            <strong>
                ${Number(deliveryLocation.distanceKm).toFixed(2)} km
            </strong>
        </div>

        <div class="order-review-row">
            <span>Payment</span>
            <strong>${paymentLabel}</strong>
        </div>

        <div class="order-review-row order-review-total">
            <span>Total</span>
            <strong>₹${total.toFixed(2)}</strong>
        </div>
    `;


    placeButton.disabled = false;

    showReviewMessage("");
};


const clearCompletedOrderState = () => {

    if (
        typeof window.clearSelectedOrderItem ===
        "function"
    ) {
        window.clearSelectedOrderItem();
    }


    if (
        typeof window.clearOrderDeliveryLocation ===
        "function"
    ) {
        window.clearOrderDeliveryLocation();
    }


    if (
        typeof window.clearSelectedOrderAddress ===
        "function"
    ) {
        window.clearSelectedOrderAddress();
    }


    if (
        typeof window.clearSelectedPaymentMethod ===
        "function"
    ) {
        window.clearSelectedPaymentMethod();
    }
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
                <strong>${orderId}</strong>
            </div>

            <div class="order-review-row">
                <span>Payment Record</span>
                <strong>${paymentId}</strong>
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

    } catch (jsonError) {

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


    const deliveryAddress =
        typeof window.getSelectedOrderAddress ===
        "function"
            ? window.getSelectedOrderAddress()
            : null;


    const paymentMethod =
        typeof window.getSelectedPaymentMethod ===
        "function"
            ? window.getSelectedPaymentMethod()
            : null;


    if (
        !orderItem ||
        !deliveryLocation ||
        !deliveryAddress ||
        !paymentMethod
    ) {

        showReviewMessage(
            "Please complete all order details first.",
            "error"
        );

        return;
    }


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

        } catch (jsonError) {

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

            placeButton.disabled =
                false;

            placeButton.textContent =
                "Place Order";
        }


        isOrderSubmitting =
            false;
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
