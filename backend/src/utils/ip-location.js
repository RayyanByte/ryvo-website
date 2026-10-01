const getClientIpAddress = (req) => {
    const forwardedFor =
        req.headers["x-forwarded-for"];

    if (typeof forwardedFor === "string") {
        const firstIp =
            forwardedFor
                .split(",")[0]
                .trim();

        if (firstIp) {
            return firstIp;
        }
    }

    return (
        req.socket?.remoteAddress ||
        req.ip ||
        ""
    );
};


const normalizeIpAddress = (ipAddress) => {
    if (!ipAddress) {
        return "";
    }

    if (ipAddress === "::1") {
        return "127.0.0.1";
    }

    if (ipAddress.startsWith("::ffff:")) {
        return ipAddress.substring(7);
    }

    return ipAddress;
};


const getIpLocation = async (ipAddress = "") => {
    const normalizedIp =
        normalizeIpAddress(ipAddress);

    const locationUrl =
        normalizedIp &&
        normalizedIp !== "127.0.0.1"
            ? `https://ipwho.is/${encodeURIComponent(normalizedIp)}`
            : "https://ipwho.is/";


    const response =
        await fetch(locationUrl);

    if (!response.ok) {
        throw new Error(
            "IP location service request failed."
        );
    }


    const result =
        await response.json();


    if (
        !result.success ||
        typeof result.latitude !== "number" ||
        typeof result.longitude !== "number"
    ) {
        throw new Error(
            "IP location data is unavailable."
        );
    }


    return {
        ip:
            result.ip ||
            normalizedIp ||
            "",
        city:
            result.city || "",
        region:
            result.region || "",
        country:
            result.country || "",
        latitude:
            result.latitude,
        longitude:
            result.longitude
    };
};


module.exports = {
    getClientIpAddress,
    normalizeIpAddress,
    getIpLocation
};
