const ORS_API_URL = "https://api.openrouteservice.org/v2/directions/driving-car";


const getRoadDistanceKm = async (
    startLatitude,
    startLongitude,
    endLatitude,
    endLongitude
) => {
    const apiKey = process.env.ORS_API_KEY;

    if (!apiKey) {
        throw new Error("ORS_API_KEY is not configured.");
    }

    if (
        !Number.isFinite(startLatitude) ||
        !Number.isFinite(startLongitude) ||
        !Number.isFinite(endLatitude) ||
        !Number.isFinite(endLongitude)
    ) {
        throw new Error("Invalid coordinates for road distance.");
    }

    const response = await fetch(ORS_API_URL, {
        method: "POST",
        headers: {
            "Authorization": apiKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            coordinates: [
                [startLongitude, startLatitude],
                [endLongitude, endLatitude]
            ]
        })
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(
            `Road distance service failed: ${response.status} ${text}`
        );
    }

    const data = await response.json();

    if (
        !data ||
        !Array.isArray(data.routes) ||
        !data.routes.length
    ) {
        throw new Error("No route found.");
    }

    const summary = data.routes[0].summary;

    if (!summary || typeof summary.distance !== "number") {
        throw new Error("Road distance not available in response.");
    }

    const distanceKm = summary.distance / 1000;

    return Number(distanceKm.toFixed(2));
};


module.exports = {
    getRoadDistanceKm
};
