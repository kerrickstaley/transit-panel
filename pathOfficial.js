const stationsRoutes = require('./stationsRoutes');

// Note: The following two calls will always return the same result:
//   getDeparturesFromJson(json, HOBOKEN, PATH_HOB_TO_33RD)
// and
//   getDeparturesFromJson(json, HOBOKEN, PATH_JSQ_TO_33RD_VIA_HOB)
// This is because the "label" and "target" fields together aren't enough to distinguish these two
// routes. In practice this doesn't matter because we will combine the information for the two
// routes and display it in a single row on the tablet anyway. The "headSign" field does contain
// information to distinguish these two but it seems to be human- rather than machine-readable.
function getDeparturesFromJson(json, station, route) {
    let consideredStation = {
        [stationsRoutes.HOBOKEN]: 'HOB',
        [stationsRoutes.NEWPORT]: 'NEW',
    }[station];
    let label = {
        [stationsRoutes.PATH_HOB_TO_WTC]: 'ToNY',
        [stationsRoutes.PATH_WTC_TO_HOB]: 'ToNJ',
        [stationsRoutes.PATH_HOB_TO_33RD]: 'ToNY',
        [stationsRoutes.PATH_33RD_TO_HOB]: 'ToNJ',
        [stationsRoutes.PATH_JSQ_TO_33RD]: 'ToNY',
        [stationsRoutes.PATH_33RD_TO_JSQ]: 'ToNJ',
        [stationsRoutes.PATH_JSQ_TO_33RD_VIA_HOB]: 'ToNY',
        [stationsRoutes.PATH_33RD_TO_JSQ_VIA_HOB]: 'ToNJ',
    }[route];
    let target = {
        [stationsRoutes.PATH_HOB_TO_WTC]: 'WTC',
        [stationsRoutes.PATH_WTC_TO_HOB]: 'HOB',
        [stationsRoutes.PATH_HOB_TO_33RD]: '33S',
        [stationsRoutes.PATH_33RD_TO_HOB]: 'HOB',
        [stationsRoutes.PATH_JSQ_TO_33RD]: '33S',
        [stationsRoutes.PATH_33RD_TO_JSQ]: 'JSQ',
        [stationsRoutes.PATH_JSQ_TO_33RD_VIA_HOB]: '33S',
        [stationsRoutes.PATH_33RD_TO_JSQ_VIA_HOB]: 'JSQ',
    }[route];

    let stationsData = json.results.filter(elem => elem.consideredStation == consideredStation);
    if (stationsData.length == 0) {
        throw new Error(`No matching stations`);
    } else if (stationsData.length > 1) {
        throw new Error(`Multiple matching stations: ${stationsData}`);
    }
    let stationData = stationsData[0];

    let destinations = stationData.destinations.filter(elem => elem.label == label);
    if (destinations.length == 0) {
        throw new Error('No matching destinations');
    } else if (destinations.length > 1) {
        throw new Error(`Multiple matching destinations: ${destinations}`);
    }
    let destination = destinations[0];

    let departures = destination.messages.filter(elem => elem.target == target).map(elem => parseInt(elem.secondsToArrival));

    return departures;
}

function getPathApiUrl() {
    return '/test_data/ridepath1.json';
}

function getDepartures(stations_routes) {
    return fetch(getPathApiUrl()).then(resp => {
        if (!resp.ok) {
            throw new Error(`HTTP error fetching PATH API URL: ${resp.status}`);
        }
        return resp.body.getReader().read();
    }).then(dataArr => {
        var json = JSON.parse(new TextDecoder().decode(dataArr.value));
        var ret = {};
        for (let [station, route] of stations_routes) {
            ret[station + '|' + route] = getDeparturesFromJson(json, station, route);
        }
        return ret;
    });
}

module.exports = {
    getDeparturesFromJson: getDeparturesFromJson,
    getDepartures: getDepartures,
};
