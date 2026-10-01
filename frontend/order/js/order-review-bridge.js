const ORDER_REVIEW_COMPONENT_URL =
    "../../order/components/order-review.html";

const ORDER_REVIEW_SCRIPT_URL =
    "../../order/js/order-review.js";

let orderReviewLoadPromise = null;

const loadOrderReview = async () => {
    if (orderReviewLoadPromise) {
        return orderReviewLoadPromise;
    }

    orderReviewLoadPromise = (async () => {
        const container = document.getElementById(
            "order-review-container"
        );

        if (!container) {
            throw new Error(
                "Missing order review container."
            );
        }

        const response = await fetch(
            ORDER_REVIEW_COMPONENT_URL
        );

        if (!response.ok) {
            throw new Error(
                `Unable to load order review component: ${response.status}`
            );
        }

        container.innerHTML = await response.text();

        await new Promise((resolve, reject) => {
            const script = document.createElement("script");

            script.src = ORDER_REVIEW_SCRIPT_URL;

            script.onload = resolve;

            script.onerror = () => {
                reject(
                    new Error(
                        "Unable to load order review script."
                    )
                );
            };

            document.body.appendChild(script);
        });

        container.hidden = false;

        container.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    })();

    try {
        await orderReviewLoadPromise;
    } catch (error) {
        orderReviewLoadPromise = null;
        console.error(
            "Order review loading error:",
            error
        );
    }
};

window.addEventListener(
    "orderPaymentConfirmed",
    loadOrderReview
);
