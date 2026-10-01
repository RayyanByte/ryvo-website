const ORDER_ADDRESS_COMPONENT_URL =
    "../../order/components/address-selection.html";

const ORDER_ADDRESS_SCRIPT_URL =
    "../../order/js/address-selection.js";

const ORDER_PAYMENT_COMPONENT_URL =
    "../../order/components/payment-selection.html";

const ORDER_PAYMENT_SCRIPT_URL =
    "../../order/js/payment-selection.js";

const PAYMENT_API_SCRIPT_URL =
    "../../order/js/payment-api.js";

const PAYMENT_STATUS_SCRIPT_URL =
    "../../order/js/payment-status.js";

const UPI_PAYMENT_SCRIPT_URL =
    "../../order/js/upi-payment.js";

const UPI_PAYMENT_STATUS_SCRIPT_URL =
    "../../order/js/upi-payment-status.js";

const PAYMENT_RESULT_SCRIPT_URL =
    "../../order/js/payment-result.js";

const PAYMENT_POLLING_SCRIPT_URL =
    "../../order/js/payment-polling.js";

const PAYMENT_FLOW_SCRIPT_URL =
    "../../order/js/payment-flow.js";


let orderAddressComponentLoaded =
    false;

let orderPaymentComponentLoaded =
    false;

let paymentRuntimeLoaded =
    false;


const loadScript = (
    scriptUrl,
    onLoad
) => {

    const script =
        document.createElement("script");

    script.src =
        scriptUrl;

    script.onload = () => {

        if (typeof onLoad === "function") {
            onLoad();
        }
    };

    script.onerror = () => {

        console.error(
            `Order module could not be loaded: ${scriptUrl}`
        );
    };

    document.body.appendChild(
        script
    );
};


const loadScriptAsync = (
    scriptUrl
) => {

    return new Promise(
        (resolve, reject) => {

            const script =
                document.createElement(
                    "script"
                );

            script.src =
                scriptUrl;

            script.onload =
                resolve;

            script.onerror = () => {

                reject(
                    new Error(
                        `Order module could not be loaded: ${scriptUrl}`
                    )
                );
            };

            document.body.appendChild(
                script
            );
        }
    );
};


const loadPaymentRuntime =
    async () => {

        if (paymentRuntimeLoaded) {
            return true;
        }

        try {

            await loadScriptAsync(
                PAYMENT_API_SCRIPT_URL
            );

            await loadScriptAsync(
                PAYMENT_STATUS_SCRIPT_URL
            );

            await loadScriptAsync(
                UPI_PAYMENT_SCRIPT_URL
            );

            await loadScriptAsync(
                UPI_PAYMENT_STATUS_SCRIPT_URL
            );

            await loadScriptAsync(
                PAYMENT_RESULT_SCRIPT_URL
            );

            await loadScriptAsync(
                PAYMENT_POLLING_SCRIPT_URL
            );

            await loadScriptAsync(
                PAYMENT_FLOW_SCRIPT_URL
            );

            paymentRuntimeLoaded =
                true;

            return true;

        } catch (error) {

            console.error(
                "Payment runtime loading error:",
                error
            );

            return false;
        }
    };


const loadOrderAddressSelection =
    async () => {

        const container =
            document.getElementById(
                "order-address-selection-container"
            );

        if (!container) {
            return;
        }

        if (orderAddressComponentLoaded) {

            container.hidden = false;

            return;
        }

        try {

            const response =
                await fetch(
                    ORDER_ADDRESS_COMPONENT_URL
                );

            if (!response.ok) {

                throw new Error(
                    "Could not load order address component."
                );
            }

            container.innerHTML =
                await response.text();

            container.hidden = false;

            loadScript(
                ORDER_ADDRESS_SCRIPT_URL,
                () => {

                    orderAddressComponentLoaded =
                        true;
                }
            );

        } catch (error) {

            console.error(
                "Order address component loading error:",
                error
            );

            container.innerHTML = `
                <p class="order-address-message">
                    Unable to load your saved addresses.
                    Please try again.
                </p>
            `;

            container.hidden = false;
        }
    };


const loadOrderPaymentSelection =
    async () => {

        const container =
            document.getElementById(
                "order-payment-selection-container"
            );

        if (!container) {
            return;
        }

        if (orderPaymentComponentLoaded) {

            container.hidden = false;

            return;
        }

        try {

            const response =
                await fetch(
                    ORDER_PAYMENT_COMPONENT_URL
                );

            if (!response.ok) {

                throw new Error(
                    "Could not load payment component."
                );
            }

            container.innerHTML =
                await response.text();

            container.hidden = false;

            const runtimeLoaded =
                await loadPaymentRuntime();

            if (!runtimeLoaded) {

                throw new Error(
                    "Payment runtime could not be loaded."
                );
            }

            loadScript(
                ORDER_PAYMENT_SCRIPT_URL,
                () => {

                    orderPaymentComponentLoaded =
                        true;
                }
            );

        } catch (error) {

            console.error(
                "Order payment component loading error:",
                error
            );

            container.innerHTML = `
                <p class="order-payment-message">
                    Unable to load payment methods.
                    Please try again.
                </p>
            `;

            container.hidden = false;
        }
    };


window.addEventListener(
    "deliveryAreaConfirmed",
    () => {

        loadOrderAddressSelection();

    }
);


window.addEventListener(
    "orderAddressConfirmed",
    () => {

        loadOrderPaymentSelection();

    }
);
