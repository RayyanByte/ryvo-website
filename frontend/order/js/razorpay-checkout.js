const RAZORPAY_CHECKOUT_URL =
    "https://checkout.razorpay.com/v1/checkout.js";


const loadRazorpayCheckout = () => {
    return new Promise(
        (resolve, reject) => {
            if (
                typeof window.Razorpay ===
                "function"
            ) {
                resolve();
                return;
            }

            const existing =
                document.querySelector(
                    'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
                );

            if (existing) {
                existing.addEventListener(
                    "load",
                    () => resolve(),
                    { once: true }
                );

                existing.addEventListener(
                    "error",
                    () =>
                        reject(
                            new Error(
                                "Unable to load Razorpay checkout."
                            )
                        ),
                    { once: true }
                );

                return;
            }

            const script =
                document.createElement(
                    "script"
                );

            script.src =
                RAZORPAY_CHECKOUT_URL;

            script.async = true;

            script.onload =
                () => resolve();

            script.onerror =
                () =>
                    reject(
                        new Error(
                            "Unable to load Razorpay checkout."
                        )
                    );

            document.head.appendChild(
                script
            );
        }
    );
};


const openRazorpayCheckout = async ({
    orderId,
    gateway,
    customerName = "RYVO Customer",
    customerEmail = "",
    customerPhone = ""
}) => {
    if (
        !gateway?.keyId ||
        !gateway?.orderId ||
        !gateway?.amount
    ) {
        throw new Error(
            "Invalid Razorpay payment data."
        );
    }

    await loadRazorpayCheckout();

    return new Promise(
        (resolve, reject) => {
            const options = {
                key:
                    gateway.keyId,

                amount:
                    gateway.amount,

                currency:
                    gateway.currency ||
                    "INR",

                name:
                    "RYVO",

                description:
                    "RYVO Food Order",

                order_id:
                    gateway.orderId,

                prefill: {
                    name:
                        customerName,

                    email:
                        customerEmail,

                    contact:
                        customerPhone
                },

                theme: {
                    color:
                        "#111111"
                },

                handler:
                    async (
                        response
                    ) => {
                        try {
                            const result =
                                await window.handleRazorpaySuccess(
                                    orderId,
                                    response
                                );

                            resolve(
                                result
                            );
                        } catch (
                            error
                        ) {
                            reject(
                                error
                            );
                        }
                    },

                modal: {
                    ondismiss:
                        () => {
                            reject(
                                new Error(
                                    "Payment window was closed."
                                )
                            );
                        }
                }
            };

            const razorpay =
                new window.Razorpay(
                    options
                );

            razorpay.on(
                "payment.failed",
                (response) => {
                    reject(
                        new Error(
                            response?.error?.description ||
                            "UPI payment failed."
                        )
                    );
                }
            );

            razorpay.open();
        }
    );
};


window.openRazorpayCheckout =
    openRazorpayCheckout;
