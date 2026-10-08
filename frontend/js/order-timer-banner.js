const ORDER_TIMER_STATUS_API =
    "http://localhost:5000/api/orders/my/latest";

const ORDER_TIMER_CHECK_INTERVAL = 5000;
const ORDER_TIMER_EXTRA_MINUTES = 15;
const ORDER_TIMER_STORAGE_KEY = "ryvo_order_timer_ends_at";
const ORDER_TIMER_ORDER_KEY = "ryvo_order_timer_order_id";

let timerIntervalId = null;
let statusCheckIntervalId = null;
let currentSecondsLeft = 0;
let currentOrderId = null;


const getAuthToken = () => {
    return localStorage.getItem("authToken");
};


const saveTimerEndTime = (orderId, endsAtMs) => {
    try {
        localStorage.setItem(ORDER_TIMER_ORDER_KEY, orderId);
        localStorage.setItem(ORDER_TIMER_STORAGE_KEY, String(endsAtMs));
    } catch (error) {
        console.error("Timer save error:", error);
    }
};


const loadTimerEndTime = (orderId) => {
    try {
        const savedOrderId = localStorage.getItem(ORDER_TIMER_ORDER_KEY);
        const savedEndsAt = localStorage.getItem(ORDER_TIMER_STORAGE_KEY);

        if (savedOrderId !== orderId || !savedEndsAt) {
            return null;
        }

        const endsAt = Number(savedEndsAt);

        return Number.isFinite(endsAt) && endsAt > 0 ? endsAt : null;

    } catch (error) {
        console.error("Timer load error:", error);
        return null;
    }
};


const clearTimerEndTime = () => {
    try {
        localStorage.removeItem(ORDER_TIMER_ORDER_KEY);
        localStorage.removeItem(ORDER_TIMER_STORAGE_KEY);
    } catch (error) {
        console.error("Timer clear error:", error);
    }
};


const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return String(minutes).padStart(2, "0") + ":" +
           String(seconds).padStart(2, "0");
};


const getMaxMinutesFromOrder = (order) => {
    // Default to 35 if not available
    const maxMinutes = Number(
        order?.estimatedTime?.maxMinutes
    );

    return Number.isFinite(maxMinutes) && maxMinutes > 0
        ? maxMinutes
        : 35;
};


const hideBanner = () => {
    const container = document.getElementById(
        "order-timer-banner-container"
    );

    if (!container) return;

    container.innerHTML = "";

    if (timerIntervalId) {
        clearInterval(timerIntervalId);
        timerIntervalId = null;
    }
};


const renderBanner = (order) => {
    const container = document.getElementById(
        "order-timer-banner-container"
    );

    if (!container) return;

    if (!container.querySelector("#order-timer-banner")) {
        container.innerHTML = `
            <div class="order-timer-banner" id="order-timer-banner">
                <span class="order-timer-label">
                    Estimated delivery
                </span>

                <span class="order-timer-value" id="order-timer-value">
                    00:00
                </span>

                <span class="order-timer-icon">
                    🛵
                </span>
            </div>
        `;
    }
};


const startTimer = (order) => {
    const orderId = order._id;

    let endsAtMs = loadTimerEndTime(orderId);

    if (!endsAtMs) {
        const maxMinutes = getMaxMinutesFromOrder(order);
        endsAtMs = Date.now() + maxMinutes * 60 * 1000;
        saveTimerEndTime(orderId, endsAtMs);
    }

    if (timerIntervalId) {
        clearInterval(timerIntervalId);
    }

    const tick = () => {
        let secondsLeft = Math.floor((endsAtMs - Date.now()) / 1000);

        if (secondsLeft <= 0) {
            // Timer khatam — 15 min add karo
            endsAtMs = Date.now() + ORDER_TIMER_EXTRA_MINUTES * 60 * 1000;
            saveTimerEndTime(orderId, endsAtMs);
            secondsLeft = ORDER_TIMER_EXTRA_MINUTES * 60;
        }

        const el = document.getElementById("order-timer-value");

        if (el) {
            el.textContent = formatTime(secondsLeft);
        }

        currentSecondsLeft = secondsLeft;
    };

    tick();

    timerIntervalId = setInterval(tick, 1000);
};


const loadLatestOrder = async () => {
    const token = getAuthToken();

    if (!token) {
        hideBanner();
        return;
    }

    try {
        const response = await fetch(
            ORDER_TIMER_STATUS_API,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            hideBanner();
            return;
        }

        const result = await response.json();

        if (
            !result.success ||
            !result.data
        ) {
            hideBanner();
            currentOrderId = null;
            return;
        }

        const order = result.data;

        if (order._id !== currentOrderId) {
            currentOrderId = order._id;

            renderBanner(order);

            startTimer(order);

        } else {
            renderBanner(order);
        }

    } catch (error) {
        console.error("Order timer banner error:", error);
        hideBanner();
    }
};


const startOrderTimerBanner = () => {
    loadLatestOrder();

    if (statusCheckIntervalId) {
        clearInterval(statusCheckIntervalId);
    }

    statusCheckIntervalId = setInterval(
        loadLatestOrder,
        ORDER_TIMER_CHECK_INTERVAL
    );
};


if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        startOrderTimerBanner
    );
} else {
    startOrderTimerBanner();
}
