let confirmedDeliveryLocation = null;


const saveConfirmedDeliveryLocation = (
    latitude,
    longitude,
    source,
    isApproximate = false,
    distanceKm = null
) => {

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {
        return false;
    }


    const normalizedDistance =
        Number.isFinite(Number(distanceKm))
            ? Number(distanceKm)
            : null;


    confirmedDeliveryLocation = {
        latitude,
        longitude,
        source,
        isApproximate,
        distanceKm:
            normalizedDistance,
        confirmedAt:
            new Date().toISOString()
    };


    window.confirmedDeliveryLocation =
        confirmedDeliveryLocation;


    window.dispatchEvent(
        new CustomEvent(
            "deliveryLocationConfirmed",
            {
                detail:
                    confirmedDeliveryLocation
            }
        )
    );


    return true;
};


const getConfirmedDeliveryLocation = () => {

    if (
        !confirmedDeliveryLocation
    ) {
        return null;
    }


    return {
        ...confirmedDeliveryLocation
    };
};


const clearConfirmedDeliveryLocation = () => {

    confirmedDeliveryLocation =
        null;


    window.confirmedDeliveryLocation =
        null;


    window.dispatchEvent(
        new CustomEvent(
            "deliveryLocationCleared"
        )
    );
};


window.saveConfirmedDeliveryLocation =
    saveConfirmedDeliveryLocation;

window.getConfirmedDeliveryLocation =
    getConfirmedDeliveryLocation;

window.clearConfirmedDeliveryLocation =
    clearConfirmedDeliveryLocation;
