const waitForAddressFallback = (
    callback
) => {

    const container =
        document.getElementById(
            "address-fallback-container"
        );


    if (
        container &&
        container.querySelector(
            "#delivery-address-fallback"
        )
    ) {
        callback();
        return;
    }


    const observer =
        new MutationObserver(
            () => {

                const loaded =
                    container?.querySelector(
                        "#delivery-address-fallback"
                    );


                if (loaded) {

                    observer.disconnect();

                    callback();
                }
            }
        );


    if (container) {

        observer.observe(
            container,
            {
                childList: true,
                subtree: true
            }
        );
    }
};


const loadSavedAddresses = async () => {

    const addressesContainer =
        document.getElementById(
            "delivery-saved-addresses"
        );


    const addressMessage =
        document.getElementById(
            "delivery-address-message"
        );


    if (!addressesContainer) {
        return;
    }


    const token =
        localStorage.getItem(
            "authToken"
        );


    if (!token) {

        addressesContainer.innerHTML = `
            <p class="delivery-address-loading">
                Please log in to use a saved address.
            </p>
        `;

        return;
    }


    try {

        const response =
            await fetch(
                "http://localhost:5000/api/addresses/",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
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
                "Unable to load saved addresses."
            );
        }


        const addresses =
            Array.isArray(result.data)
                ? result.data
                : [];


        if (!addresses.length) {

            addressesContainer.innerHTML = `
                <p class="delivery-address-loading">
                    No saved addresses available.
                </p>
            `;

            return;
        }


        addressesContainer.innerHTML = "";


        addresses.forEach(
            (address) => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "delivery-address-card";


                const title =
                    address.label
                        ? address.label
                            .charAt(0)
                            .toUpperCase() +
                          address.label.slice(1)
                        : "Saved Address";


                const addressText =
                    [
                        address.fullName,
                        address.addressLine,
                        address.landmark,
                        address.city,
                        address.state,
                        address.pincode
                    ]
                    .filter(Boolean)
                    .join(", ");


                button.innerHTML = `
                    <p class="delivery-address-card-title">
                        ${title}
                    </p>

                    <p class="delivery-address-card-text">
                        ${addressText}
                    </p>
                `;


                button.addEventListener(
                    "click",
                    async () => {

                        document
                            .querySelectorAll(
                                ".delivery-address-card"
                            )
                            .forEach(
                                (card) => {

                                    card.classList.remove(
                                        "is-selected"
                                    );

                                }
                            );


                        button.classList.add(
                            "is-selected"
                        );


                        if (addressMessage) {

                            addressMessage.textContent =
                                "Finding this address on the map...";
                        }


                        try {

                            const geocodeResponse =
                                await fetch(
                                    "http://localhost:5000/api/delivery/geocode-address",
                                    {
                                        method:
                                            "POST",

                                        headers: {
                                            "Content-Type":
                                                "application/json"
                                        },

                                        body:
                                            JSON.stringify({
                                                fullName:
                                                    address.fullName,

                                                addressLine:
                                                    address.addressLine,

                                                landmark:
                                                    address.landmark,

                                                city:
                                                    address.city,

                                                state:
                                                    address.state,

                                                pincode:
                                                    address.pincode
                                            })
                                    }
                                );


                            const geocodeResult =
                                await geocodeResponse.json();


                            if (
                                !geocodeResponse.ok ||
                                !geocodeResult.success
                            ) {

                                throw new Error(
                                    geocodeResult.message ||
                                    "Unable to find this address."
                                );
                            }


                            const latitude =
                                Number(
                                    geocodeResult
                                        .data
                                        .latitude
                                );


                            const longitude =
                                Number(
                                    geocodeResult
                                        .data
                                        .longitude
                                );


                            if (
                                !Number.isFinite(
                                    latitude
                                ) ||
                                !Number.isFinite(
                                    longitude
                                )
                            ) {

                                throw new Error(
                                    "Invalid coordinates received."
                                );
                            }


                            if (
                                typeof window
                                    .setDeliveryMapLocation !==
                                "function"
                            ) {

                                throw new Error(
                                    "Delivery map is not ready yet."
                                );
                            }


                            window
                                .setDeliveryMapLocation(
                                    latitude,
                                    longitude,
                                    17,
                                    "address"
                                );


                            const isApproximate =
                                geocodeResult
                                    .data
                                    .isApproximate === true;


                            if (addressMessage) {

                                if (
                                    isApproximate
                                ) {

                                    addressMessage.textContent =
                                        "Approximate area found. Please adjust the crosshair to your exact delivery point before confirming.";

                                } else {

                                    addressMessage.textContent =
                                        "Address location found. Check the map and adjust the exact delivery point if needed.";
                                }
                            }


                        } catch (error) {

                            console.error(
                                "Address geocoding error:",
                                error
                            );


                            if (addressMessage) {

                                addressMessage.textContent =
                                    error.message ||
                                    "Unable to find this address.";
                            }
                        }
                    }
                );


                addressesContainer.appendChild(
                    button
                );
            }
        );


    } catch (error) {

        console.error(
            "Saved addresses error:",
            error
        );


        addressesContainer.innerHTML = `
            <p class="delivery-address-loading">
                Unable to load saved addresses.
            </p>
        `;


        if (addressMessage) {

            addressMessage.textContent =
                error.message;
        }
    }
};


waitForAddressFallback(
    loadSavedAddresses
);
