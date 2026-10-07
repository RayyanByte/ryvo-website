const DEFAULT_LOCATION = [
    23.2599,
    77.4126
];

const DEFAULT_ZOOM = 5;
const LOCATION_ZOOM = 17;


let deliveryMap = null;

let selectedLatitude = null;
let selectedLongitude = null;

let selectedLocationSource = "map";

let programmaticMapMove = false;


const getElement = (id) => {
    return document.getElementById(id);
};


const updateCoordinates = () => {

    const coordinatesElement =
        getElement(
            "delivery-map-coordinates"
        );

    if (
        !coordinatesElement ||
        !Number.isFinite(selectedLatitude) ||
        !Number.isFinite(selectedLongitude)
    ) {
        return;
    }


    coordinatesElement.textContent =
        `Selected location: ${selectedLatitude.toFixed(6)}, ${selectedLongitude.toFixed(6)}`;
};


const setMapLocation = (
    latitude,
    longitude,
    zoom = LOCATION_ZOOM,
    source = "map"
) => {

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        return false;
    }


    selectedLatitude = latitude;
    selectedLongitude = longitude;

    selectedLocationSource = source;


    if (deliveryMap) {

        programmaticMapMove = true;

        deliveryMap.setView(
            [latitude, longitude],
            zoom
        );
    }


    updateCoordinates();

    return true;
};


const renderDeliveryMessage = (
    type,
    title,
    message
) => {

    const messageElement =
        getElement(
            "delivery-location-message"
        );

    if (!messageElement) {
        return;
    }


    messageElement.className =
        `delivery-location-message ${type}`;


    messageElement.innerHTML = `
        <strong>${title}</strong>
        <span>${message}</span>
    `;
};


const renderDeliveryStatus = (
    type,
    title,
    message
) => {

    const statusElement =
        getElement(
            "delivery-location-status"
        );

    const statusTitle =
        getElement(
            "delivery-status-title"
        );

    const statusMessage =
        getElement(
            "delivery-status-message"
        );

    const statusIcon =
        getElement(
            "delivery-status-icon"
        );


    if (
        !statusElement ||
        !statusTitle ||
        !statusMessage
    ) {
        return;
    }


    statusElement.hidden = false;


    statusElement.classList.remove(
        "is-available",
        "is-unavailable",
        "is-error"
    );


    statusElement.classList.add(
        type
    );


    statusTitle.textContent =
        title;

    statusMessage.textContent =
        message;


    if (statusIcon) {

        if (type === "is-available") {
            statusIcon.textContent = "✓";
        } else if (
            type === "is-unavailable"
        ) {
            statusIcon.textContent = "⚠";
        } else {
            statusIcon.textContent = "!";
        }
    }
};


const checkDeliveryArea = async () => {

    if (
        !Number.isFinite(selectedLatitude) ||
        !Number.isFinite(selectedLongitude)
    ) {

        renderDeliveryStatus(
            "is-error",
            "Location not selected",
            "Please select a delivery location on the map first."
        );

        return false;
    }


    const confirmButton =
        getElement(
            "confirm-map-location-button"
        );


    if (confirmButton) {
        confirmButton.disabled = true;
        confirmButton.textContent =
            "Checking...";
    }

    if (
        typeof window.clearConfirmedDeliveryLocation ===
        "function"
    ) {
        window.clearConfirmedDeliveryLocation();
    }

    try {

        const response =
            await fetch(
                "http://localhost:5000/api/delivery/check-area",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        latitude:
                            selectedLatitude,
                        longitude:
                            selectedLongitude
                    })
                }
            );


        const result =
            await response.json();


        if (
            response.ok &&
            result.success
        ) {

            const distance =
                result.data?.distanceKm;


            const message =
                result.message ||
                (
                    Number.isFinite(distance)
                        ? `Delivery is available. You are ${distance} km away.`
                        : "Delivery is available at this location."
                );


            renderDeliveryMessage(
                "is-available",
                "Delivery available",
                message
            );


            window.dispatchEvent(
                new CustomEvent(
                    "deliveryAreaConfirmed",
                    {
                        detail: {
                            latitude:
                                selectedLatitude,

                            longitude:
                                selectedLongitude,

                            source:
                                selectedLocationSource,

                            isApproximate:
                                selectedLocationSource ===
                                "address",

                            distanceKm:
                                distance
                        }
                    }
                )
            );


            return true;
        }


        if (
            response.status === 403
        ) {

            renderDeliveryMessage(
                "is-unavailable",
                "Delivery unavailable",
                result.message ||
                    "This location is outside the delivery area."
            );


            renderDeliveryStatus(
                "is-unavailable",
                "Outside delivery area",
                result.message ||
                    "This location is outside the delivery area."
            );


            return false;
        }


        if (
            response.status === 503
        ) {

            renderDeliveryMessage(
                "is-error",
                "Delivery area is not configured",
                result.message ||
                    "Shop delivery location is not configured yet."
            );


            renderDeliveryStatus(
                "is-error",
                "Delivery area is not configured",
                result.message ||
                    "Shop delivery location is not configured yet."
            );


            return false;
        }


        renderDeliveryMessage(
            "is-error",
            "Unable to check delivery",
            result.message ||
                "Something went wrong while checking the delivery area."
        );


        renderDeliveryStatus(
            "is-error",
            "Unable to check delivery",
            result.message ||
                "Something went wrong while checking the delivery area."
        );


        return false;

    } catch (error) {

        console.error(
            "Delivery area check failed:",
            error
        );


        renderDeliveryMessage(
            "is-error",
            "Connection error",
            "Unable to contact the delivery service."
        );


        renderDeliveryStatus(
            "is-error",
            "Connection error",
            "Unable to contact the delivery service."
        );


        return false;

    } finally {

        if (confirmButton) {
            confirmButton.disabled = false;
            confirmButton.textContent =
                "Confirm Location";
        }
    }
};


const setupMap = () => {

    const mapElement =
        getElement(
            "delivery-map"
        );


    if (!mapElement) {
        return;
    }


    deliveryMap =
        L.map(
            mapElement,
            {
                zoomControl: true
            }
        ).setView(
            DEFAULT_LOCATION,
            DEFAULT_ZOOM
        );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(
        deliveryMap
    );


    deliveryMap.on(
        "click",
        (event) => {

            setMapLocation(
                event.latlng.lat,
                event.latlng.lng,
                LOCATION_ZOOM,
                "map"
            );
        }
    );


    deliveryMap.on(
        "moveend",
        () => {

            const center =
                deliveryMap.getCenter();


            if (!center) {
                return;
            }


            selectedLatitude =
                center.lat;

            selectedLongitude =
                center.lng;


            if (!programmaticMapMove) {
                selectedLocationSource =
                    "map";
            }


            programmaticMapMove = false;


            updateCoordinates();
        }
    );


    window.setDeliveryMapLocation =
        (
            latitude,
            longitude,
            zoom = LOCATION_ZOOM,
            source = "map"
        ) => {

            return setMapLocation(
                latitude,
                longitude,
                zoom,
                source
            );
        };


    setTimeout(
        () => {
            deliveryMap.invalidateSize();
        },
        100
    );
};


const setupGpsButton = () => {

    const gpsButton =
        getElement(
            "map-gps-button"
        );


    if (!gpsButton) {
        return;
    }


    gpsButton.addEventListener(
        "click",
        async () => {

            if (
                typeof window.getCurrentLocation !==
                "function"
            ) {
                return;
            }


            gpsButton.disabled = true;


            try {

                const location =
                    await window.getCurrentLocation();


                setMapLocation(
                    location.latitude,
                    location.longitude,
                    LOCATION_ZOOM,
                    "gps"
                );


                renderDeliveryMessage(
                    "is-available",
                    "Current location found",
                    "Check the map and adjust the exact delivery point before confirming."
                );

            } catch (error) {

                renderDeliveryMessage(
                    "is-error",
                    "Location unavailable",
                    error.message
                );

            } finally {

                gpsButton.disabled = false;
            }
        }
    );
};


const loadLocationPermission =
    async () => {

        const container =
            getElement(
                "location-permission-container"
            );


        if (!container) {
            return;
        }


        try {

            const response =
                await fetch(
                    "../components/location-permission.html"
                );


            if (!response.ok) {
                return;
            }


            container.innerHTML =
                await response.text();


            const allowButton =
                getElement(
                    "allow-location-button"
                );

            const mapButton =
                getElement(
                    "choose-map-button"
                );


            if (allowButton) {

                allowButton.addEventListener(
                    "click",
                    async () => {

                        try {

                            const location =
                                await window.getCurrentLocation();


                            setMapLocation(
                                location.latitude,
                                location.longitude,
                                LOCATION_ZOOM,
                                "gps"
                            );


                            container.hidden =
                                true;

                        } catch (error) {

                            renderDeliveryMessage(
                                "is-error",
                                "Location unavailable",
                                error.message
                            );
                        }
                    }
                );
            }


            if (mapButton) {

                mapButton.addEventListener(
                    "click",
                    () => {

                        container.hidden =
                            true;


                        if (deliveryMap) {
                            deliveryMap.invalidateSize();
                        }
                    }
                );
            }

        } catch (error) {

            console.error(
                "Location permission component failed:",
                error
            );
        }
    };


const setupCitySearch = () => {

    const form =
        getElement(
            "map-search-form"
        );

    const input =
        getElement(
            "map-search-input"
        );

    const results =
        getElement(
            "map-search-results"
        );


    if (
        !form ||
        !input ||
        !results
    ) {
        return;
    }


    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const query =
                input.value.trim();


            if (!query) {
                return;
            }


            results.innerHTML =
                "<p>Searching...</p>";


            try {

                const response =
                    await fetch(
                        `http://localhost:5000/api/delivery/search-location?q=${encodeURIComponent(query)}`
                    );


                const result =
                    await response.json();


                if (
                    !response.ok ||
                    !result.success ||
                    !Array.isArray(result.data) ||
                    result.data.length === 0
                ) {

                    results.innerHTML =
                        "<p>No location found.</p>";

                    return;
                }


                results.innerHTML =
                    "";


                result.data.forEach(
                    (location) => {

                        const button =
                            document.createElement(
                                "button"
                            );


                        button.type =
                            "button";

                        button.textContent =
                            location.name;


                        button.addEventListener(
                            "click",
                            () => {

                                setMapLocation(
                                    Number(
                                        location.latitude
                                    ),
                                    Number(
                                        location.longitude
                                    ),
                                    LOCATION_ZOOM,
                                    "search"
                                );


                                results.innerHTML =
                                    "";

                                input.value =
                                    location.name;
                            }
                        );


                        results.appendChild(
                            button
                        );
                    }
                );

            } catch (error) {

                console.error(
                    "Location search failed:",
                    error
                );


                results.innerHTML =
                    "<p>Unable to search location.</p>";
            }
        }
    );
};


const loadLocationStatus =
    async () => {

        const container =
            getElement(
                "location-status-container"
            );


        if (!container) {
            return;
        }


        try {

            const response =
                await fetch(
                    "../components/location-status.html"
                );


            if (!response.ok) {
                return;
            }


            container.innerHTML =
                await response.text();

        } catch (error) {

            console.error(
                "Location status component failed:",
                error
            );
        }
    };


const loadAddressFallback =
    async () => {

        const container =
            getElement(
                "address-fallback-container"
            );


        if (!container) {
            return;
        }


        try {

            const response =
                await fetch(
                    "../components/address-fallback.html"
                );


            if (!response.ok) {
                return;
            }


            container.innerHTML =
                await response.text();

        } catch (error) {

            console.error(
                "Address fallback component failed:",
                error
            );
        }
    };


const setupConfirmButton = () => {

    const confirmButton =
        getElement(
            "confirm-map-location-button"
        );


    if (!confirmButton) {
        return;
    }


    confirmButton.addEventListener(
        "click",
        checkDeliveryArea
    );
};


const initializeDeliveryMap =
    async () => {

        setupMap();

        setupGpsButton();

        setupCitySearch();

        setupConfirmButton();

        await loadLocationPermission();

        await loadLocationStatus();

        await loadAddressFallback();


        if (
            typeof window.initializeAddressFallback ===
            "function"
        ) {
            window.initializeAddressFallback();
        }


        if (deliveryMap) {
            deliveryMap.invalidateSize();
        }
    };


if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeDeliveryMap
    );

} else {

    initializeDeliveryMap();
}
