const RYVO_PAYMENT_API =
    "/api/payments";


const getCustomerPaymentToken = () => {
    return localStorage.getItem("token") ||
        localStorage.getItem("authToken");
};


const createCustomerPayment = async (
    orderId,
    paymentMethod
) => {

    const token =
        getCustomerPaymentToken();

    const response =
        await fetch(
            RYVO_PAYMENT_API,
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

    const result =
        await response.json();

    if (!response.ok) {
        throw new Error(
            result?.message ||
            "Unable to create payment."
        );
    }

    return result;
};


const verifyCustomerUpiPayment =
    async (
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
    ) => {

        const token =
            getCustomerPaymentToken();

        const response =
            await fetch(
                `${RYVO_PAYMENT_API}/${encodeURIComponent(
                    orderId
                )}/verify-upi`,
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
                            razorpayOrderId,
                            razorpayPaymentId,
                            razorpaySignature
                        })
                }
            );

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(
                result?.message ||
                "Payment verification failed."
            );
        }

        return result;
    };


const getCustomerPayment =
    async (orderId) => {

        const token =
            getCustomerPaymentToken();

        const response =
            await fetch(
                `${RYVO_PAYMENT_API}/${encodeURIComponent(
                    orderId
                )}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(
                result?.message ||
                "Unable to fetch payment."
            );
        }

        return result;
    };


window.createCustomerPayment =
    createCustomerPayment;

window.verifyCustomerUpiPayment =
    verifyCustomerUpiPayment;

window.getCustomerPayment =
    getCustomerPayment;

const startRazorpayPayment = async (
    orderId
) => {

    const result =
        await createCustomerPayment(
            orderId,
            "upi"
        );

    const gateway =
        result?.data?.gateway;

    if (!gateway?.orderId ||
        !gateway?.keyId) {
        throw new Error(
            "Razorpay payment gateway data is missing."
        );
    }

    if (
        typeof window.Razorpay !==
        "function"
    ) {
        throw new Error(
            "Razorpay checkout is not loaded."
        );
    }

    return new Promise(
        (resolve, reject) => {

            const options = {

                key:
                    gateway.keyId,

                amount:
                    gateway.amount,

                currency:
                    gateway.currency || "INR",

                name:
                    "RYVO",

                description:
                    "RYVO Order Payment",

                order_id:
                    gateway.orderId,

                handler:
                    async function (
                        response
                    ) {
                        try {

                            const verified =
                                await verifyCustomerUpiPayment(
                                    orderId,
                                    response.razorpay_order_id,
                                    response.razorpay_payment_id,
                                    response.razorpay_signature
                                );

                            resolve(
                                verified
                            );

                        } catch (error) {

                            reject(
                                error
                            );
                        }
                    },

                modal: {
                    ondismiss:
                        function () {
                            reject(
                                new Error(
                                    "Payment cancelled."
                                )
                            );
                        }
                },

                theme: {
                    color: "#111111"
                }
            };

            const razorpay =
                new window.Razorpay(
                    options
                );

            razorpay.on(
                "payment.failed",
                function () {
                    reject(
                        new Error(
                            "Payment failed."
                        )
                    );
                }
            );

            razorpay.open();
        }
    );
};


window.startRazorpayPayment =
    startRazorpayPayment;

const loadRazorpayCheckout =
    () => {

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
                        'script[data-razorpay="true"]'
                    );

                if (existing) {

                    existing.addEventListener(
                        "load",
                        () => resolve(),
                        {
                            once: true
                        }
                    );

                    existing.addEventListener(
                        "error",
                        () =>
                            reject(
                                new Error(
                                    "Unable to load Razorpay."
                                )
                            ),
                        {
                            once: true
                        }
                    );

                    return;
                }

                const script =
                    document.createElement(
                        "script"
                    );

                script.src =
                    "https://checkout.razorpay.com/v1/checkout.js";

                script.async = true;

                script.dataset.razorpay =
                    "true";

                script.onload =
                    () => resolve();

                script.onerror =
                    () =>
                        reject(
                            new Error(
                                "Unable to load Razorpay."
                            )
                        );

                document.head.appendChild(
                    script
                );
            }
        );
    };


window.loadRazorpayCheckout =
    loadRazorpayCheckout;
