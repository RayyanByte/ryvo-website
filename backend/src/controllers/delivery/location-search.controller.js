const searchLocation = async (req, res) => {
    try {
        const query =
            typeof req.query.q === "string"
                ? req.query.q.trim()
                : "";

        if (!query) {
            return res.status(400).json({
                success: false,
                message:
                    "City or location search is required."
            });
        }

        if (query.length < 2) {
            return res.status(400).json({
                success: false,
                message:
                    "Search must contain at least 2 characters."
            });
        }

        const searchUrl =
            "https://nominatim.openstreetmap.org/search?" +
            new URLSearchParams({
                q: query,
                format: "jsonv2",
                limit: "5",
                addressdetails: "1",
                countrycodes: "in"
            }).toString();

        const response =
            await fetch(
                searchUrl,
                {
                    headers: {
                        "User-Agent":
                            "RYVO-Food-Delivery/1.0"
                    }
                }
            );

        if (!response.ok) {
            throw new Error(
                "Location search service request failed."
            );
        }

        const results =
            await response.json();

        const locations =
            Array.isArray(results)
                ? results
                    .filter(
                        (item) =>
                            Number.isFinite(
                                Number(item.lat)
                            ) &&
                            Number.isFinite(
                                Number(item.lon)
                            )
                    )
                    .map((item) => ({
                        name:
                            item.display_name || "",
                        latitude:
                            Number(item.lat),
                        longitude:
                            Number(item.lon)
                    }))
                : [];

        return res.status(200).json({
            success: true,
            data: locations
        });

    } catch (error) {
        console.error(
            "Location search error:",
            error
        );

        return res.status(503).json({
            success: false,
            message:
                "Unable to search this location right now."
        });
    }
};


const requestNominatim = async (params) => {

    const searchUrl =
        "https://nominatim.openstreetmap.org/search?" +
        new URLSearchParams({
            ...params,
            format: "jsonv2",
            limit: "1",
            addressdetails: "1",
            countrycodes: "in"
        }).toString();


    const response =
        await fetch(
            searchUrl,
            {
                headers: {
                    "User-Agent":
                        "RYVO-Food-Delivery/1.0"
                }
            }
        );


    if (!response.ok) {
        throw new Error(
            "Address geocoding service request failed."
        );
    }


    return response.json();
};


const geocodeAddress = async (req, res) => {

    try {

        const {
            addressLine,
            city,
            state,
            pincode
        } = req.body;


        const cleanAddressLine =
            typeof addressLine === "string"
                ? addressLine.trim()
                : "";

        const cleanCity =
            typeof city === "string"
                ? city.trim()
                : "";

        const cleanState =
            typeof state === "string"
                ? state.trim()
                : "";

        const cleanPincode =
            typeof pincode === "string"
                ? pincode.trim()
                : "";


        if (
            !cleanCity &&
            !cleanState &&
            !cleanPincode &&
            !cleanAddressLine
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Address information is required."
            });
        }


        /*
         * First attempt:
         * Structured address search.
         *
         * Nominatim supports:
         * street, city, state and postalcode
         * as separate search parameters.
         */

        const exactResults =
            await requestNominatim({

                street:
                    cleanAddressLine,

                city:
                    cleanCity,

                state:
                    cleanState,

                postalcode:
                    cleanPincode,

                country:
                    "India"
            });


        if (
            Array.isArray(exactResults) &&
            exactResults.length
        ) {

            const result =
                exactResults[0];


            const latitude =
                Number(result.lat);

            const longitude =
                Number(result.lon);


            const matchedPincode =
                result.address?.postcode ||
                "";


            if (
                Number.isFinite(latitude) &&
                Number.isFinite(longitude)
            ) {

                const postcodeMatches =
                    !cleanPincode ||
                    matchedPincode ===
                        cleanPincode;


                if (postcodeMatches) {

                    return res.status(200).json({
                        success: true,
                        message:
                            "Exact address location found.",
                        data: {
                            latitude,
                            longitude,
                            displayName:
                                result.display_name ||
                                "",
                            isApproximate:
                                false
                        }
                    });
                }
            }
        }


        /*
         * Fallback:
         * Search only the city/state/postcode.
         *
         * This is deliberately marked approximate.
         * It must never be treated as the customer's
         * final delivery coordinate.
         */

        const fallbackResults =
            await requestNominatim({

                city:
                    cleanCity,

                state:
                    cleanState,

                postalcode:
                    cleanPincode,

                country:
                    "India"
            });


        if (
            !Array.isArray(fallbackResults) ||
            !fallbackResults.length
        ) {

            return res.status(404).json({
                success: false,
                message:
                    "Unable to find this address on the map."
            });
        }


        const fallback =
            fallbackResults[0];


        const fallbackLatitude =
            Number(fallback.lat);

        const fallbackLongitude =
            Number(fallback.lon);


        if (
            !Number.isFinite(
                fallbackLatitude
            ) ||
            !Number.isFinite(
                fallbackLongitude
            )
        ) {

            return res.status(503).json({
                success: false,
                message:
                    "The location service returned invalid coordinates."
            });
        }


        return res.status(200).json({
            success: true,
            message:
                "Location found.",
            data: {
                latitude:
                    fallbackLatitude,
                longitude:
                    fallbackLongitude,
                displayName:
                    fallback.display_name || "",
                isApproximate:
                    true,
                matchedPincode:
                    fallback.address?.postcode ||
                    ""
            }
        });

    } catch (error) {

        console.error(
            "Address geocoding error:",
            error
        );

        return res.status(503).json({
            success: false,
            message:
                "Unable to find this address right now."
        });
    }
};


module.exports = {
    searchLocation,
    geocodeAddress
};
