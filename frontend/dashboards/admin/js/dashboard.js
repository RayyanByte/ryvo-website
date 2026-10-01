const SHOP_API_URL =
    "http://localhost:5000/api/shop";

const DELIVERY_BOYS_API_URL =
    "http://localhost:5000/api/auth/admin/delivery-boys";


const getAuthToken = () => {
    return localStorage.getItem("authToken");
};


const getAuthHeaders = () => {
    return {
        Authorization:
            `Bearer ${getAuthToken()}`
    };
};


const setMessage = (
    elementId,
    message
) => {
    const element =
        document.getElementById(elementId);

    if (!element) {
        return;
    }

    element.textContent = message;
};


const updateShopBadge = (isOpen) => {
    const badge =
        document.getElementById(
            "shop-status-badge"
        );

    if (!badge) {
        return;
    }

    badge.textContent =
        isOpen
            ? "Open"
            : "Closed";
};


const renderShopSettings = (shop) => {
    const isOpen =
        document.getElementById(
            "shop-is-open"
        );

    const statusMessage =
        document.getElementById(
            "shop-status-message"
        );

    const latitude =
        document.getElementById(
            "shop-latitude"
        );

    const longitude =
        document.getElementById(
            "shop-longitude"
        );

    const radius =
        document.getElementById(
            "shop-radius"
        );

    if (
        !isOpen ||
        !statusMessage ||
        !latitude ||
        !longitude ||
        !radius
    ) {
        return;
    }

    isOpen.value =
        String(shop.isOpen);

    statusMessage.value =
        shop.statusMessage || "";

    latitude.value =
        shop.location?.latitude ?? "";

    longitude.value =
        shop.location?.longitude ?? "";

    radius.value =
        shop.deliveryRadiusKm ?? "";

    updateShopBadge(
        shop.isOpen
    );
};


const loadShopSettings = async () => {
    try {
        const response =
            await fetch(
                SHOP_API_URL
            );

        const result =
            await response.json();

        if (
            !response.ok ||
            !result.success
        ) {
            throw new Error(
                result.message ||
                "Unable to load shop settings."
            );
        }

        renderShopSettings(
            result.data
        );
    } catch (error) {
        console.error(
            "Shop settings error:",
            error
        );

        setMessage(
            "shop-message",
            error.message ||
            "Unable to load shop settings."
        );
    }
};


const initializeShopForm = () => {
    const form =
        document.getElementById(
            "shop-settings-form"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            const authToken =
                getAuthToken();

            if (!authToken) {
                setMessage(
                    "shop-message",
                    "Please sign in as admin."
                );

                return;
            }

            const isOpen =
                document.getElementById(
                    "shop-is-open"
                ).value === "true";

            const statusMessage =
                document.getElementById(
                    "shop-status-message"
                ).value.trim();

            const latitude =
                Number(
                    document.getElementById(
                        "shop-latitude"
                    ).value
                );

            const longitude =
                Number(
                    document.getElementById(
                        "shop-longitude"
                    ).value
                );

            const deliveryRadiusKm =
                Number(
                    document.getElementById(
                        "shop-radius"
                    ).value
                );

            setMessage(
                "shop-message",
                "Saving shop settings..."
            );

            try {
                const response =
                    await fetch(
                        SHOP_API_URL,
                        {
                            method: "PATCH",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                ...getAuthHeaders()
                            },

                            body:
                                JSON.stringify({
                                    isOpen,
                                    statusMessage,
                                    location: {
                                        latitude,
                                        longitude
                                    },
                                    deliveryRadiusKm
                                })
                        }
                    );

                const result =
                    await response.json();

                if (
                    !response.ok ||
                    !result.success
                ) {
                    throw new Error(
                        result.message ||
                        "Unable to update shop settings."
                    );
                }

                renderShopSettings(
                    result.data
                );

                setMessage(
                    "shop-message",
                    "Shop settings saved."
                );
            } catch (error) {
                console.error(
                    "Shop update error:",
                    error
                );

                setMessage(
                    "shop-message",
                    error.message ||
                    "Unable to update shop settings."
                );
            }
        }
    );
};


const initializeDeliveryBoyForm = () => {
    const form =
        document.getElementById(
            "delivery-boy-form"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            const authToken =
                getAuthToken();

            if (!authToken) {
                setMessage(
                    "delivery-boy-message",
                    "Please sign in as admin."
                );

                return;
            }

            const formData =
                new FormData(form);

            const name =
                formData
                    .get("name")
                    .trim();

            const email =
                formData
                    .get("email")
                    .trim()
                    .toLowerCase();

            const phone =
                formData
                    .get("phone")
                    .trim();

            const password =
                formData.get("password");

            setMessage(
                "delivery-boy-message",
                "Creating delivery account..."
            );

            try {
                const response =
                    await fetch(
                        DELIVERY_BOYS_API_URL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                ...getAuthHeaders()
                            },

                            body:
                                JSON.stringify({
                                    name,
                                    email,
                                    phone,
                                    password
                                })
                        }
                    );

                const result =
                    await response.json();

                if (
                    !response.ok ||
                    !result.success
                ) {
                    throw new Error(
                        result.message ||
                        "Unable to create delivery account."
                    );
                }

                form.reset();

                setMessage(
                    "delivery-boy-message",
                    "Delivery boy account created successfully."
                );
            } catch (error) {
                console.error(
                    "Delivery boy creation error:",
                    error
                );

                setMessage(
                    "delivery-boy-message",
                    error.message ||
                    "Unable to create delivery account."
                );
            }
        }
    );
};


const initializeAdminDashboard = () => {
    const token =
        getAuthToken();

    if (!token) {
        setMessage(
            "shop-message",
            "Please sign in as admin."
        );

        setMessage(
            "delivery-boy-message",
            "Please sign in as admin."
        );

        return;
    }

    initializeShopForm();
    initializeDeliveryBoyForm();
    loadShopSettings();
};


initializeAdminDashboard();
