const setupConfirmedLocationBridge = () => {

    window.addEventListener(
        "deliveryAreaConfirmed",
        (event) => {

            const detail =
                event.detail || {};


            const latitude =
                Number(detail.latitude);

            const longitude =
                Number(detail.longitude);

            const source =
                detail.source || "map";

            const isApproximate =
                Boolean(detail.isApproximate);

            const distanceKm =
                Number.isFinite(
                    Number(detail.distanceKm)
                )
                    ? Number(detail.distanceKm)
                    : null;


            if (
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude) ||
                latitude < -90 ||
                latitude > 90 ||
                longitude < -180 ||
                longitude > 180
            ) {
                console.error(
                    "Confirmed location bridge: invalid approved coordinates."
                );

                return;
            }


            if (
                typeof window
                    .saveConfirmedDeliveryLocation !==
                "function"
            ) {
                console.error(
                    "Confirmed location module is not available."
                );

                return;
            }


            const saved =
                window.saveConfirmedDeliveryLocation(
                    latitude,
                    longitude,
                    source,
                    isApproximate,
                    distanceKm
                );


            if (!saved) {
                console.error(
                    "Approved delivery location could not be saved."
                );

                return;
            }


            console.log(
                "Confirmed delivery location saved:",
                window.getConfirmedDeliveryLocation()
            );
        }
    );
};


if (
    document.readyState === "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        setupConfirmedLocationBridge
    );
} else {
    setupConfirmedLocationBridge();
}
