const ORDER_PAYMENT_STORAGE_KEY =
    "ryvo_order_payment_method";


let selectedPaymentMethod = null;


const SUPPORTED_PAYMENT_METHODS = [
    "cod",
    "upi"
];


const savePaymentMethod = (
    paymentMethod
) => {

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


        if (
            !SUPPORTED_PAYMENT_METHODS.includes(
                storedMethod
            )
        ) {
            return null;
        }


        return storedMethod;

    } catch (error) {

        console.error(
            "Payment method storage read error:",
            error
        );

        return null;
    }
};


const renderPaymentMessage = (
    message
) => {

    const messageElement =
        document.getElementById(
            "order-payment-message"
        );


    if (!messageElement) {
        return;
    }


    messageElement.textContent =
        message;
};


const updatePaymentButtons = () => {

    const buttons =
        document.querySelectorAll(
            "[data-payment-method]"
        );


    buttons.forEach(
        (button) => {

            const isSelected =
                button.dataset.paymentMethod ===
                selectedPaymentMethod;


            button.classList.toggle(
                "selected",
                isSelected
            );


            button.setAttribute(
                "aria-pressed",
                isSelected
                    ? "true"
                    : "false"
            );
        }
    );


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


    selectedPaymentMethod =
        paymentMethod;


    const saved =
        savePaymentMethod(
            paymentMethod
        );


    if (!saved) {
        return false;
    }


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
            "Please select a payment method first."
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
        "Payment method confirmed."
    );
};


const initializePaymentSelection = () => {

    const storedMethod =
        loadPaymentMethod();


    if (storedMethod) {

        selectedPaymentMethod =
            storedMethod;
    }


    document
        .querySelectorAll(
            "[data-payment-method]"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        selectPaymentMethod(
                            button.dataset.paymentMethod
                        );
                    }
                );
            }
        );


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
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializePaymentSelection
    );

} else {

    initializePaymentSelection();
}
