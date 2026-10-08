const ADMIN_SHOP_TOGGLE_INTERVAL = 10000;

let adminShopIsOpen = false;


const updateAdminShopUI = (isOpen) => {
    adminShopIsOpen = isOpen;

    const statusText = document.getElementById("admin-shop-status-text");
    const toggle = document.getElementById("admin-shop-switch");

    if (statusText) {
        statusText.textContent = isOpen ? "OPEN" : "CLOSED";
        statusText.classList.toggle("open", isOpen);
        statusText.classList.toggle("closed", !isOpen);
    }

    if (toggle) {
        toggle.classList.toggle("on", isOpen);
        toggle.setAttribute("aria-checked", String(isOpen));
    }
};


const loadAdminShopStatus = async () => {
    try {
        if (typeof shopAdminApi === "undefined") return;

        const result = await shopAdminApi.getStatus();

        if (result && result.success && result.data) {
            updateAdminShopUI(Boolean(result.data.isOpen));
        }
    } catch (error) {
        console.error("Shop status load failed:", error);
    }
};


const toggleAdminShopStatus = async () => {
    const toggle = document.getElementById("admin-shop-switch");

    if (!toggle) return;

    if (typeof shopAdminApi === "undefined") {
        alert("Shop API not loaded.");
        return;
    }

    const newState = !adminShopIsOpen;

    // Optimistic UI update
    updateAdminShopUI(newState);

    try {
        const result = await shopAdminApi.update({ isOpen: newState });

        if (!result || result.success === false) {
            throw new Error(result?.message || "Update failed");
        }

    } catch (error) {
        console.error("Shop toggle failed:", error);

        // Revert to previous state
        updateAdminShopUI(!newState);

        alert("Unable to change shop status. Please try again.");
    }
};


const startAdminShopToggle = () => {
    const toggle = document.getElementById("admin-shop-switch");

    if (!toggle) return;

    toggle.addEventListener("click", toggleAdminShopStatus);

    toggle.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleAdminShopStatus();
        }
    });

    loadAdminShopStatus();

    setInterval(loadAdminShopStatus, ADMIN_SHOP_TOGGLE_INTERVAL);
};


if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startAdminShopToggle);
} else {
    startAdminShopToggle();
}
