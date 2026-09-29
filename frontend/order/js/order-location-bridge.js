const ORDER_LOCATION_STORAGE_KEY =
    "ryvo_order_delivery_location";


const saveOrderDeliveryLocation = (location) => {

    if (!location || typeof location !== "object") {
        return false;
    }


    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);
    const distanceKm =
        Number.isFinite(Number(location.distanceKm))
            ? Number(location.distanceKm)
            : null;


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


    const source =
        ["gps", "map", "search", "address"].includes(location.source)
            ? location.source
            : "map";


    const savedLocation = {
        latitude,
        longitude,
        source,
        isApproximate: Boolean(location.isApproximate),
        distanceKm,
        confirmedAt:
            location.confirmedAt ||
            new Date().toISOString()
    };


    sessionStorage.setItem(
        ORDER_LOCATION_STORAGE_KEY,
        JSON.stringify(savedLocation)
    );


    window.orderDeliveryLocation =
        savedLocation;


    return true;
};


const getOrderDeliveryLocation = () => {

    if (window.orderDeliveryLocation) {
        return {
            ...window.orderDeliveryLocation
        };
    }


    const storedLocation =
        sessionStorage.getItem(
            ORDER_LOCATION_STORAGE_KEY
        );


    if (!storedLocation) {
        return null;
    }


    try {

        const location =
            JSON.parse(storedLocation);


        if (!saveOrderDeliveryLocation(location)) {
            return null;
        }


        return {
            ...window.orderDeliveryLocation
        };

    } catch (error) {

        console.error(
            "Saved order delivery location is invalid:",
            error
        );


        sessionStorage.removeItem(
            ORDER_LOCATION_STORAGE_KEY
        );


        return null;
    }
};


const clearOrderDeliveryLocation = () => {

    window.orderDeliveryLocation = null;

    sessionStorage.removeItem(
        ORDER_LOCATION_STORAGE_KEY
    );
};


window.saveOrderDeliveryLocation =
    saveOrderDeliveryLocation;

window.getOrderDeliveryLocation =
    getOrderDeliveryLocation;

window.clearOrderDeliveryLocation =
    clearOrderDeliveryLocation;


window.addEventListener(
    "deliveryAreaConfirmed",
    (event) => {

        const location =
            event.detail || null;


        const saved =
            saveOrderDeliveryLocation(location);


        if (!saved) {

            console.error(
                "Order delivery location could not be saved."
            );

            return;
        }


        window.dispatchEvent(
            new CustomEvent(
                "orderDeliveryLocationSaved",
                {
                    detail:
                        getOrderDeliveryLocation()
                }
            )
        );
    }
);
