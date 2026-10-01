const ORDER_PAYMENT_STORAGE_KEY =
    "ryvo_order_payment_method";

let selectedPaymentMethod = null;

const SUPPORTED_PAYMENT_METHODS = [
    "cod",
    "upi"
];

const savePaymentMethod = (paymentMethod) => {
    try {
        sessionStorage.setItem(
            ORDER_PAYMENT_STORAGE_KEY,
            paymentMethod
        );

        return true;
    } catch (error) {
        console.error(
            "Payment method storage error:",
            error
        );

        return false;
    }
};

const loadPaymentMethod = () => {
    try {
        const storedMethod =
            sessionStorage.getItem(
                ORDER_PAYMENT_STORAGE_KEY
            );

        return SUPPORTED_PAYMENT_METHODS.includes(
            storedMethod
        )
            ? storedMethod
            : null;
    } catch (error) {
        console.error(
            "Payment method storage read error:",
            error
        );

        return null;
    }
};

const renderPaymentMessage = (
    message,
    type = ""
) => {
    const element =
        document.getElementById(
            "order-payment-message"
        );

    if (!element) {
        return;
    }

    element.textContent = message;
    element.className =
        `order-payment-message ${type}`.trim();
};

const updatePaymentButtons = () => {
    document
        .querySelectorAll(
            "[data-payment-method]"
        )
        .forEach((button) => {
            const selected =
                button.dataset.paymentMethod ===
                selectedPaymentMethod;

            button.classList.toggle(
                "selected",
                selected
            );

            button.setAttribute(
                "aria-pressed",
                selected ? "true" : "false"
            );
        });

    const confirmButton =
        document.getElementById(
            "confirm-order-payment-button"
        );

    if (confirmButton) {
        confirmButton.disabled =
            !selectedPaymentMethod;
    }
};

const selectPaymentMethod = (
    paymentMethod
) => {
    if (
        !SUPPORTED_PAYMENT_METHODS.includes(
            paymentMethod
        )
    ) {
        return false;
    }

    if (
        !savePaymentMethod(
            paymentMethod
        )
    ) {
        renderPaymentMessage(
            "Unable to save payment selection.",
            "error"
        );

        return false;
    }

    selectedPaymentMethod =
        paymentMethod;

    updatePaymentButtons();

    renderPaymentMessage(
        paymentMethod === "cod"
            ? "Cash on Delivery selected."
            : "UPI selected."
    );

    return true;
};

const confirmPaymentMethod = () => {
    if (!selectedPaymentMethod) {
        renderPaymentMessage(
            "Please select a payment method first.",
            "error"
        );

        return;
    }

    window.orderPaymentMethod =
        selectedPaymentMethod;

    window.dispatchEvent(
        new CustomEvent(
            "orderPaymentConfirmed",
            {
                detail: {
                    paymentMethod:
                        selectedPaymentMethod
                }
            }
        )
    );

    renderPaymentMessage(
        selectedPaymentMethod === "cod"
            ? "Cash on Delivery confirmed."
            : "UPI selected. Payment will remain pending until payment is confirmed."
    );
};

const initializePaymentSelection = () => {
    selectedPaymentMethod =
        loadPaymentMethod();

    document
        .querySelectorAll(
            "[data-payment-method]"
        )
        .forEach((button) => {
            button.addEventListener(
                "click",
                () => {
                    selectPaymentMethod(
                        button.dataset.paymentMethod
                    );
                }
            );
        });

    const confirmButton =
        document.getElementById(
            "confirm-order-payment-button"
        );

    if (confirmButton) {
        confirmButton.addEventListener(
            "click",
            confirmPaymentMethod
        );
    }

    updatePaymentButtons();
};

window.getSelectedPaymentMethod = () => {
    return selectedPaymentMethod;
};

window.clearSelectedPaymentMethod = () => {
    selectedPaymentMethod = null;
    window.orderPaymentMethod = null;

    try {
        sessionStorage.removeItem(
            ORDER_PAYMENT_STORAGE_KEY
        );
    } catch (error) {
        console.error(
            "Payment method storage clear error:",
            error
        );
    }

    updatePaymentButtons();
};

if (
    document.readyState ===
    "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        initializePaymentSelection
    );
} else {
    initializePaymentSelection();
}
