const paymentScripts = [
    "/order/js/payment-api.js",
    "/order/js/payment-upi-api.js",
    "/order/js/razorpay-success.js",
    "/order/js/razorpay-checkout.js",
    "/order/js/payment-order-integration.js"
];


const loadPaymentScripts = async () => {

    for (
        const src of paymentScripts
    ) {

        if (
            document.querySelector(
                `script[src="${src}"]`
            )
        ) {
            continue;
        }

        await new Promise(
            (resolve, reject) => {

                const script =
                    document.createElement(
                        "script"
                    );

                script.src = src;

                script.onload =
                    resolve;

                script.onerror =
                    () =>
                        reject(
                            new Error(
                                `Unable to load ${src}`
                            )
                        );

                document.body.appendChild(
                    script
                );
            }
        );
    }
};


window.loadPaymentScripts =
    loadPaymentScripts;

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => {
            loadPaymentScripts();
        }
    );

} else {

    loadPaymentScripts();
}
