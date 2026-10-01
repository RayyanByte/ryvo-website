let confirmedLocationDetail = null;


const renderConfirmedLocation = () => {

    const section =
        document.getElementById(
            "confirmed-delivery-location"
        );

    const coordinates =
        document.getElementById(
            "confirmed-location-coordinates"
        );

    const details =
        document.getElementById(
            "confirmed-location-details"
        );


    if (
        !section ||
        !coordinates ||
        !details ||
        !confirmedLocationDetail
    ) {
        return;
    }


    const latitude =
        Number(
            confirmedLocationDetail.latitude
        );

    const longitude =
        Number(
            confirmedLocationDetail.longitude
        );


    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {
        return;
    }


    coordinates.textContent =
        `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;


    const distanceKm =
        Number(
            confirmedLocationDetail.distanceKm
        );


    const source =
        confirmedLocationDetail.source ||
        "map";


    if (
        Number.isFinite(distanceKm)
    ) {

        details.textContent =
            `Distance from shop: ${distanceKm.toFixed(2)} km · Source: ${source}`;

    } else {

        details.textContent =
            `Source: ${source}`;
    }


    section.hidden = false;
};


const loadConfirmedLocationUI = async () => {

    const container =
        document.getElementById(
            "confirmed-location-container"
        );


    if (!container) {
        console.error(
            "Confirmed location container not found."
        );

        return;
    }


    window.addEventListener(
        "deliveryLocationConfirmed",
        (event) => {

            confirmedLocationDetail =
                event.detail || null;

            renderConfirmedLocation();
        }
    );


    try {

        const response =
            await fetch(
                "../components/confirmed-location.html"
            );


        if (!response.ok) {
            throw new Error(
                "Confirmed location component could not be loaded."
            );
        }


        container.innerHTML =
            await response.text();


        if (
            typeof window.getConfirmedDeliveryLocation ===
            "function"
        ) {

            const existingLocation =
                window.getConfirmedDeliveryLocation();


            if (existingLocation) {

                confirmedLocationDetail =
                    existingLocation;
            }
        }


        renderConfirmedLocation();

    } catch (error) {

        console.error(
            "Confirmed location UI failed:",
            error
        );
    }
};


if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        loadConfirmedLocationUI
    );

} else {

    loadConfirmedLocationUI();
}
