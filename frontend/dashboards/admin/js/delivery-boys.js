const initializeDeliveryBoys = () => {
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

            const data =
                new FormData(form);

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
                                    name:
                                        data
                                            .get("name")
                                            .trim(),

                                    email:
                                        data
                                            .get("email")
                                            .trim()
                                            .toLowerCase(),

                                    phone:
                                        data
                                            .get("phone")
                                            .trim(),

                                    password:
                                        data.get(
                                            "password"
                                        )
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
                        "Unable to create account."
                    );
                }

                form.reset();

                setMessage(
                    "delivery-boy-message",
                    "Delivery boy account created successfully."
                );

                if (
                    typeof loadOrders ===
                    "function"
                ) {
                    loadOrders();
                }

            } catch (error) {
                setMessage(
                    "delivery-boy-message",
                    error.message
                );
            }
        }
    );
};
