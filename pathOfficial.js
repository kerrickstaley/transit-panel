const stationsRoutes = require('./stationsRoutes');

// Note: The following two calls will always return the same result:
//   getDepartures(json, HOBOKEN, PATH_HOB_TO_33RD)
// and
//   getDepartures(json, HOBOKEN, PATH_JSQ_TO_33RD_VIA_HOB)
// This is because the "label" and "target" fields together aren't enough to distinguish these two
// routes. In practice this doesn't matter because we will combine the information for the two
// routes and display it in a single row on the tablet anyway. The "headSign" field does contain
// information to distinguish these two but it seems to be human- rather than machine-readable.
function getDepartures(json, station, route) {
    let consideredStation = {
        [stationsRoutes.HOBOKEN]: 'HOB',
    }[station];
    let label = {
        [stationsRoutes.PATH_HOB_TO_WTC]: 'ToNY',
        [stationsRoutes.PATH_HOB_TO_33RD]: 'ToNY',
        [stationsRoutes.PATH_JSQ_TO_33RD_VIA_HOB]: 'ToNY',
    }[route];
    let target = {
        [stationsRoutes.PATH_HOB_TO_WTC]: 'WTC',
        [stationsRoutes.PATH_HOB_TO_33RD]: '33S',
        [stationsRoutes.PATH_JSQ_TO_33RD_VIA_HOB]: '33S',
    }[route];

    let stationsData = json.results.filter(elem => elem.consideredStation == consideredStation);
    if (stationsData.length != 1) {
        throw new Error(`Not exactly one matching station: ${stationsData}`);
    }
    let stationData = stationsData[0];

    let destinations = stationData.destinations.filter(elem => elem.label == label);
    if (destinations.length == 0) {
        throw new Error('No matching destinations');
    } else if (destinations.length > 1) {
        throw new Error(`Multiple matching destination: ${destinations}`);
    }
    let destination = destinations[0];

    let departures = destination.messages.filter(elem => elem.target == target).map(elem => parseInt(elem.secondsToArrival));

    return departures;
}

module.exports = {
    'getDepartures': getDepartures,
};
