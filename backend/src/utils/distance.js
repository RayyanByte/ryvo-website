const EARTH_RADIUS_KM = 6371;


const calculateDistanceKm = (
    latitude1,
    longitude1,
    latitude2,
    longitude2
) => {
    const toRadians = (degrees) => {
        return degrees * (Math.PI / 180);
    };


    const lat1 = toRadians(latitude1);
    const lat2 = toRadians(latitude2);

    const deltaLatitude =
        toRadians(latitude2 - latitude1);

    const deltaLongitude =
        toRadians(longitude2 - longitude1);


    const a =
        Math.sin(deltaLatitude / 2) *
        Math.sin(deltaLatitude / 2) +
        Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLongitude / 2) *
        Math.sin(deltaLongitude / 2);


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return EARTH_RADIUS_KM * c;
};


const checkDeliveryRadius = (
    customerLatitude,
    customerLongitude,
    shopLatitude,
    shopLongitude,
    deliveryRadiusKm
) => {
    const distanceKm =
        calculateDistanceKm(
            customerLatitude,
            customerLongitude,
            shopLatitude,
            shopLongitude
        );


    const roundedDistanceKm =
        Number(
            distanceKm.toFixed(2)
        );


    const roundedRadiusKm =
        Number(
            deliveryRadiusKm.toFixed(2)
        );


    const isWithinRadius =
        distanceKm <= deliveryRadiusKm;


    const outsideDistanceKm =
        isWithinRadius
            ? 0
            : Number(
                (distanceKm - deliveryRadiusKm)
                    .toFixed(2)
            );


    return {
        isWithinRadius,
        distanceKm: roundedDistanceKm,
        deliveryRadiusKm: roundedRadiusKm,
        outsideDistanceKm
    };
};


module.exports = {
    calculateDistanceKm,
    checkDeliveryRadius
};
