const ADMIN_BADGE_INTERVAL = 10000;


const updateAdminBadges = async () => {
    try {
        const result = await window.getAdminOrders({});

        if (!result || !Array.isArray(result.data)) return;

        const orders = result.data;

        const counts = {
            "orders-all": orders.length,
            "orders-pending": orders.filter((o) => o.status === "pending").length,
            "orders-confirmed": orders.filter((o) => o.status === "confirmed").length,
            "orders-preparing": orders.filter((o) => o.status === "preparing").length,
            "orders-out": orders.filter((o) => o.status === "out_for_delivery").length,
            "orders-delivered": orders.filter((o) => o.status === "delivered").length,
            "orders-cancelled": orders.filter((o) => o.status === "cancelled").length
        };

        Object.entries(counts).forEach(([key, count]) => {
            const badge = document.querySelector(`[data-badge="${key}"]`);

            if (!badge) return;

            if (count > 0 && key !== "orders-all") {
                badge.textContent = count;
                badge.hidden = false;
            } else {
                badge.textContent = "";
                badge.hidden = true;
            }
        });

    } catch (error) {
        console.error("Admin badge update failed:", error);
    }
};


const startAdminBadges = () => {
    updateAdminBadges();

    setInterval(updateAdminBadges, ADMIN_BADGE_INTERVAL);
};


if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startAdminBadges);
} else {
    startAdminBadges();
}
