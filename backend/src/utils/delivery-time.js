const getEstimatedDeliveryTime = (distanceKm, ranges) => {
    if (!Array.isArray(ranges) || !ranges.length) {
        return null;
    }

    if (!Number.isFinite(distanceKm) || distanceKm < 0) {
        return null;
    }

    const sorted = [...ranges].sort(
        (a, b) => a.minKm - b.minKm
    );

    for (const range of sorted) {
        if (
            distanceKm >= range.minKm &&
            distanceKm <= range.maxKm
        ) {
            return {
                minMinutes: range.minMinutes,
                maxMinutes: range.maxMinutes,
                displayText:
                    `${range.minMinutes}-${range.maxMinutes} min`,
                matchedRange: {
                    minKm: range.minKm,
                    maxKm: range.maxKm
                }
            };
        }
    }

    const lastRange = sorted[sorted.length - 1];

    if (distanceKm > lastRange.maxKm) {
        return {
            minMinutes: lastRange.minMinutes,
            maxMinutes: lastRange.maxMinutes,
            displayText:
                `${lastRange.minMinutes}-${lastRange.maxMinutes} min`,
            matchedRange: {
                minKm: lastRange.minKm,
                maxKm: lastRange.maxKm
            }
        };
    }

    const firstRange = sorted[0];

    return {
        minMinutes: firstRange.minMinutes,
        maxMinutes: firstRange.maxMinutes,
        displayText:
            `${firstRange.minMinutes}-${firstRange.maxMinutes} min`,
        matchedRange: {
            minKm: firstRange.minKm,
            maxKm: firstRange.maxKm
        }
    };
};


module.exports = {
    getEstimatedDeliveryTime
};
