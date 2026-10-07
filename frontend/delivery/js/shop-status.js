document.addEventListener("DOMContentLoaded", async () => {
    const section = document.querySelector(".delivery-location-picker");
    if (!section) return;

    const notice = document.createElement("div");
    notice.id = "delivery-shop-closed-notice";
    notice.style.cssText = `
        display:none;
        position:fixed;
        left:16px;
        right:16px;
        bottom:16px;
        z-index:99999;
        padding:14px 18px;
        border:1px solid #f1c40f;
        border-radius:12px;
        background:#fff8dc;
        color:#5f4b00;
        font-weight:600;
        text-align:center;
        box-sizing:border-box;
        box-shadow:0 6px 24px rgba(0,0,0,0.15);
    `;

    section.prepend(notice);

    const blockOrdering = (message) => {
        notice.style.display = "block";
        notice.textContent =
            "🔒 Shop is currently closed. Ordering is temporarily unavailable.";

        section
            .querySelectorAll(
                "button, input, select, textarea"
            )
            .forEach((element) => {
                if (element.id !== "map-search-input") {
                    element.disabled = true;
                }
            });
    };

    const checkShopStatus = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/shop",
                { cache: "no-store" }
            );

            const result = await response.json();

            if (
                result.success &&
                result.data &&
                !result.data.isOpen
            ) {
                blockOrdering(result.data.statusMessage);
            }
        } catch (error) {
            console.error(
                "Unable to check shop status:",
                error
            );
        }
    };

    await checkShopStatus();

    setInterval(checkShopStatus, 5000);
});
