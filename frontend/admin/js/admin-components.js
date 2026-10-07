const loadAdminComponent = async (
    targetId,
    componentPath
) => {
    const target =
        document.getElementById(
            targetId
        );

    if (!target) {
        return;
    }

    const response =
        await fetch(
            componentPath
        );

    if (!response.ok) {
        throw new Error(
            `Unable to load ${componentPath}`
        );
    }

    target.innerHTML =
        await response.text();
};


const initializeAdminComponents =
    async () => {
        await loadAdminComponent(
            "admin-orders",
            "components/order-dashboard.html"
        );

        await loadAdminComponent(
            "admin-payments",
            "components/payment-dashboard.html"
        );

        window.dispatchEvent(
            new Event(
                "adminComponentsLoaded"
            )
        );
    };


initializeAdminComponents();


window.addEventListener(
    "adminComponentsLoaded",
    () => {
        if (
            typeof window.initializeAdminOrderDashboard ===
            "function"
        ) {
            window.initializeAdminOrderDashboard();
        }

        if (
            typeof window.initializeAdminPaymentDashboard ===
            "function"
        ) {
            window.initializeAdminPaymentDashboard();
        }
    }
);
