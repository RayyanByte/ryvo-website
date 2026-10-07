const loadAdminComponent = async (
    targetId,
    componentPath
) => {
    const target =
        document.getElementById(targetId);

    if (!target) {
        return;
    }

    const response =
        await fetch(componentPath);

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

        await loadAdminComponent(
            "admin-delivery",
            "components/delivery-dashboard.html"
        );

        await loadAdminComponent(
            "admin-food",
            "components/food-dashboard.html"
        );

        await loadAdminComponent(
            "admin-categories",
            "components/category-dashboard.html"
        );

        await loadAdminComponent(
            "admin-customers",
            "components/customer-dashboard.html"
        );

        await loadAdminComponent(
            "admin-shop",
            "components/shop-dashboard.html"
        );

        window.dispatchEvent(
            new Event(
                "adminComponentsLoaded"
            )
        );
    };


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

        if (
            typeof window.initializeAdminDeliveryDashboard ===
            "function"
        ) {
            window.initializeAdminDeliveryDashboard();
        }

        if (
            typeof window.initFoodDashboard ===
            "function"
        ) {
            window.initFoodDashboard();
        }

        if (
            typeof window.initCategoryDashboard ===
            "function"
        ) {
            window.initCategoryDashboard();
        }

        if (
            typeof window.initCustomerDashboard ===
            "function"
        ) {
            window.initCustomerDashboard();
        }

        if (
            typeof window.initShopDashboard ===
            "function"
        ) {
            window.initShopDashboard();
        }
    }
);


initializeAdminComponents();
