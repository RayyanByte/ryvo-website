const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!("geolocation" in navigator)) {
            reject(
                new Error(
                    "Location services are not supported by this browser."
                )
            );

            return;
        }


        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;

                const accuracy =
                    position.coords.accuracy;


                if (
                    !Number.isFinite(latitude) ||
                    !Number.isFinite(longitude)
                ) {
                    reject(
                        new Error(
                            "Invalid location data received."
                        )
                    );

                    return;
                }


                resolve({
                    latitude,
                    longitude,
                    accuracy
                });
            },

            (error) => {
                let message =
                    "Unable to get your location.";

                if (
                    error.code ===
                    error.PERMISSION_DENIED
                ) {
                    message =
                        "Location permission was denied.";
                }

                if (
                    error.code ===
                    error.POSITION_UNAVAILABLE
                ) {
                    message =
                        "Your location is currently unavailable.";
                }

                if (
                    error.code ===
                    error.TIMEOUT
                ) {
                    message =
                        "Location request timed out.";
                }


                reject(
                    new Error(message)
                );
            },

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
};


if (typeof window !== "undefined") {
    window.getCurrentLocation =
        getCurrentLocation;
}
