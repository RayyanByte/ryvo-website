const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!("geolocation" in navigator)) {
            reject(new Error("Location services are not supported by this browser."));
            return;
        }

        let bestPosition = null;
        let watchId = null;
        let finished = false;

        const finish = (error = null) => {
            if (finished) return;

            finished = true;

            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }

            if (error) {
                reject(error);
                return;
            }

            if (!bestPosition) {
                reject(new Error("Unable to get your current location."));
                return;
            }

            const { latitude, longitude, accuracy } = bestPosition.coords;

            if (
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude)
            ) {
                reject(new Error("Invalid location data received."));
                return;
            }

            resolve({
                latitude,
                longitude,
                accuracy
            });
        };

        const timer = setTimeout(() => {
            if (bestPosition) {
                finish();
            } else {
                finish(
                    new Error(
                        "Unable to get your current location. Please try again."
                    )
                );
            }
        }, 15000);

        watchId = navigator.geolocation.watchPosition(
            (position) => {
                bestPosition = position;

                const accuracy =
                    Number(position.coords.accuracy);

                if (
                    Number.isFinite(accuracy) &&
                    accuracy <= 50
                ) {
                    clearTimeout(timer);
                    finish();
                }
            },

            (error) => {
                clearTimeout(timer);

                if (error.code === error.PERMISSION_DENIED) {
                    finish(
                        new Error(
                            "Location permission was denied. Please allow location access and try again."
                        )
                    );
                    return;
                }

                if (error.code === error.POSITION_UNAVAILABLE) {
                    finish(
                        new Error(
                            "Your current location is unavailable. Please try again."
                        )
                    );
                    return;
                }

                if (error.code === error.TIMEOUT) {
                    finish(
                        new Error(
                            "Location request timed out. Please try again."
                        )
                    );
                    return;
                }

                finish(
                    new Error(
                        "Unable to get your current location."
                    )
                );
            },

            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    });
};

if (typeof window !== "undefined") {
    window.getCurrentLocation = getCurrentLocation;
}
