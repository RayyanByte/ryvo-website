document.addEventListener("DOMContentLoaded", async () => {
    let shopOpen = true;

    const banner = document.createElement("div");
    banner.id = "ryvo-shop-status";
    banner.style.cssText = `
        display:none;
        position:fixed;
        left:16px;
        right:16px;
        bottom:16px;
        z-index:99999;
        padding:14px 18px;
        border-radius:12px;
        background:#fff8dc;
        color:#5f4b00;
        border:1px solid #f1c40f;
        font-weight:600;
        text-align:center;
        box-sizing:border-box;
        box-shadow:0 6px 24px rgba(0,0,0,0.15);
    `;

    const updateUI = () => {
        const orderButtons = document.querySelectorAll(
            ".food-card-button, .featured-food-details-order, [data-featured-order]"
        );

        if (!shopOpen) {
            banner.style.display = "block";
            banner.textContent = "🔒 Shop is currently closed. Ordering is temporarily unavailable.";

            orderButtons.forEach((button) => {
                button.disabled = true;
                button.dataset.shopDisabled = "true";
                button.style.opacity = "0.5";
                button.style.cursor = "not-allowed";
            });
        } else {
            banner.style.display = "none";

            orderButtons.forEach((button) => {
                if (button.dataset.shopDisabled === "true") {
                    button.disabled = false;
                    button.dataset.shopDisabled = "false";
                    button.style.opacity = "";
                    button.style.cursor = "";
                }
            });
        }
    };

    document.body.appendChild(banner);

    const loadShopStatus = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/shop"
            );

            const result = await response.json();

            if (result.success) {
                shopOpen = Boolean(result.data?.isOpen);
                updateUI();
            }
        } catch (error) {
            console.error("Unable to load shop status:", error);
        }
    };

    await loadShopStatus();

    let lastButtonCount = 0;

    const syncDynamicButtons = () => {
        const count = document.querySelectorAll(
            ".food-card-button, .featured-food-details-order, [data-featured-order]"
        ).length;

        if (count !== lastButtonCount) {
            lastButtonCount = count;
            updateUI();
        }
    };

    setInterval(syncDynamicButtons, 500);
});
