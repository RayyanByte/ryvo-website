const updateShopBadge = (isOpen) => {
    const badge =
        document.getElementById(
            "shop-status-badge"
        );

    if (badge) {
        badge.textContent =
            isOpen ? "Open" : "Closed";
    }
};


const renderShopSettings = (shop) => {
    document.getElementById(
        "shop-is-open"
    ).value = String(shop.isOpen);

    document.getElementById(
        "shop-status-message"
    ).value =
        shop.statusMessage || "";

    document.getElementById(
        "shop-latitude"
    ).value =
        shop.location?.latitude ?? "";

    document.getElementById(
        "shop-longitude"
    ).value =
        shop.location?.longitude ?? "";

    document.getElementById(
        "shop-radius"
    ).value =
        shop.deliveryRadiusKm ?? "";

    updateShopBadge(
        shop.isOpen
    );
};


const loadShopSettings = async () => {
    try {
        const response =
            await fetch(SHOP_API_URL);

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
        setMessage(
            "shop-message",
            error.message
        );
    }
};


const initializeShopSettings = () => {
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

            const body = {
                isOpen:
                    document.getElementById(
                        "shop-is-open"
                    ).value === "true",

                statusMessage:
                    document.getElementById(
                        "shop-status-message"
                    ).value.trim(),

                location: {
                    latitude:
                        Number(
                            document.getElementById(
                                "shop-latitude"
                            ).value
                        ),

                    longitude:
                        Number(
                            document.getElementById(
                                "shop-longitude"
                            ).value
                        )
                },

                deliveryRadiusKm:
                    Number(
                        document.getElementById(
                            "shop-radius"
                        ).value
                    )
            };

            setMessage(
                "shop-message",
                "Saving..."
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
                                JSON.stringify(body)
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
                        "Unable to update shop."
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
                setMessage(
                    "shop-message",
                    error.message
                );
            }
        }
    );

    loadShopSettings();
};
