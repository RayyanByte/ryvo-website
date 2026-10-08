const ADMIN_COMPONENTS = {
    "dashboard": {
        title: "Dashboard",
        subtitle: "Welcome to RYVO Admin",
        html: null
    },
    "orders-all": {
        title: "All Orders",
        subtitle: "All orders across every status",
        html: "/admin/components/order-dashboard.html",
        status: ""
    },
    "orders-pending": {
        title: "New Orders",
        subtitle: "Orders waiting for confirmation",
        html: "/admin/components/order-dashboard.html",
        status: "pending"
    },
    "orders-confirmed": {
        title: "Confirmed Orders",
        subtitle: "Orders ready for preparation",
        html: "/admin/components/order-dashboard.html",
        status: "confirmed"
    },
    "orders-preparing": {
        title: "Preparing Orders",
        subtitle: "Orders being prepared",
        html: "/admin/components/order-dashboard.html",
        status: "preparing"
    },
    "orders-out": {
        title: "Out for Delivery",
        subtitle: "Orders on the way",
        html: "/admin/components/order-dashboard.html",
        status: "out_for_delivery"
    },
    "orders-delivered": {
        title: "Delivered Orders",
        subtitle: "Completed orders",
        html: "/admin/components/order-dashboard.html",
        status: "delivered"
    },
    "orders-cancelled": {
        title: "Cancelled Orders",
        subtitle: "Cancelled orders",
        html: "/admin/components/order-dashboard.html",
        status: "cancelled"
    },
    "payments": {
        title: "Payments",
        subtitle: "Manage payments",
        html: "/admin/components/payment-dashboard.html"
    },
    "delivery": {
        title: "Delivery Boys",
        subtitle: "Manage delivery partners",
        html: "/admin/components/delivery-dashboard.html"
    },
    "food": {
        title: "Food",
        subtitle: "Manage food items",
        html: "/admin/components/food-dashboard.html"
    },
    "categories": {
        title: "Categories",
        subtitle: "Manage food categories",
        html: "/admin/components/category-dashboard.html"
    },
    "customers": {
        title: "Customers",
        subtitle: "Manage customers",
        html: "/admin/components/customer-dashboard.html"
    },
    "shop": {
        title: "Shop",
        subtitle: "Shop settings",
        html: "/admin/components/shop-dashboard.html"
    }
};


const ADMIN_ROUTE_KEY = "ryvo_admin_route";


const setAdminPageTitle = (title, subtitle) => {
    const titleEl = document.getElementById("admin-page-title");
    const subtitleEl = document.getElementById("admin-page-subtitle");

    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;
};


const setActiveNav = (route) => {
    document
        .querySelectorAll("[data-admin-route]")
        .forEach((el) => {
            el.classList.toggle(
                "active",
                el.dataset.adminRoute === route
            );
        });
};


const loadAdminComponent = async (route) => {

    const config = ADMIN_COMPONENTS[route];

    if (!config) {
        console.error("Unknown admin route:", route);
        return;
    }

    const content = document.getElementById("admin-content");

    if (!content) return;

    setAdminPageTitle(config.title, config.subtitle);
    setActiveNav(route);

    localStorage.setItem(ADMIN_ROUTE_KEY, route);

    if (route === "dashboard") {
        content.innerHTML = `
            <section class="admin-dashboard-home">
                <h2>Welcome to RYVO Admin</h2>
                <p>Select a section from the sidebar to get started.</p>
            </section>
        `;
        return;
    }

    if (!config.html) return;

    content.innerHTML = `<p class="admin-loading">Loading...</p>`;

    try {

        const response = await fetch(config.html);

        if (!response.ok) {
            throw new Error("Failed to load component");
        }

        const html = await response.text();

        content.innerHTML = html;

        if (config.status !== undefined) {
            const filter = document.getElementById("order-status-filter");

            if (filter) {
                filter.value = config.status || "";
            }
        }

        if (
            route.startsWith("orders-") &&
            typeof window.initializeAdminOrderDashboard === "function"
        ) {
            window.initializeAdminOrderDashboard();
        } else if (
            route === "food" &&
            typeof window.initFoodDashboard === "function"
        ) {
            window.initFoodDashboard();
        } else if (
            route === "categories" &&
            typeof window.initCategoryDashboard === "function"
        ) {
            window.initCategoryDashboard();
        } else if (
            route === "customers" &&
            typeof window.initCustomerDashboard === "function"
        ) {
            window.initCustomerDashboard();
        } else if (
            route === "shop" &&
            typeof window.initShopDashboard === "function"
        ) {
            window.initShopDashboard();
        } else if (
            route === "payments" &&
            typeof window.initializeAdminPaymentDashboard === "function"
        ) {
            window.initializeAdminPaymentDashboard();
        } else if (
            route === "delivery" &&
            typeof window.initializeAdminDeliveryDashboard === "function"
        ) {
            window.initializeAdminDeliveryDashboard();
        }

    } catch (error) {
        console.error("Component load error:", error);

        content.innerHTML = `
            <p style="color:#b3261e;padding:20px 0;">
                Unable to load this section. Please try again.
            </p>
        `;
    }
};


const openSidebar = () => {
    document.getElementById("admin-sidebar")?.classList.add("open");
    document.getElementById("admin-sidebar-overlay")?.classList.add("open");
};


const closeSidebar = () => {
    document.getElementById("admin-sidebar")?.classList.remove("open");
    document.getElementById("admin-sidebar-overlay")?.classList.remove("open");
};


const setupAdminRouter = () => {

    document
        .querySelectorAll("[data-admin-route]")
        .forEach((el) => {
            el.addEventListener("click", (event) => {
                event.preventDefault();

                const route = el.dataset.adminRoute;

                loadAdminComponent(route);

                if (window.innerWidth <= 900) {
                    closeSidebar();
                }
            });
        });

    document
        .querySelectorAll("[data-admin-toggle]")
        .forEach((parent) => {
            const key = parent.dataset.adminToggle;

            parent.addEventListener("click", () => {
                parent.classList.toggle("open");

                document
                    .querySelector(`[data-admin-children="${key}"]`)
                    ?.classList.toggle("open");
            });
        });

    document
        .getElementById("admin-hamburger")
        ?.addEventListener("click", openSidebar);

    document
        .getElementById("admin-sidebar-overlay")
        ?.addEventListener("click", closeSidebar);

    const savedRoute =
        localStorage.getItem(ADMIN_ROUTE_KEY) ||
        "orders-pending";

    loadAdminComponent(savedRoute);
};


if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupAdminRouter);
} else {
    setupAdminRouter();
}


window.loadAdminComponent = loadAdminComponent;
