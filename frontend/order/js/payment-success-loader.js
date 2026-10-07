(() => {

    const scripts = [
        "/order/js/payment-api.js",
        "/order/js/payment-upi-api.js",
        "/order/js/razorpay-success.js",
        "/order/js/razorpay-checkout.js",
        "/order/js/payment-upi-flow.js"
    ];

    const loadNext = (index) => {

        if (index >= scripts.length) {
            return;
        }

        const existing =
            document.querySelector(
                `script[src="${scripts[index]}"]`
            );

        if (existing) {
            loadNext(index + 1);
            return;
        }

        const script =
            document.createElement("script");

        script.src =
            scripts[index];

        script.onload =
            () => loadNext(index + 1);

        document.body.appendChild(
            script
        );
    };

    loadNext(0);

})();
