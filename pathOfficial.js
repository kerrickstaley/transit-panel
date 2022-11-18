const ids = require('./ids');

// This fetches from the "official" PATH API at https://www.panynj.gov/bin/portauthority/ridepath.json
// "Official" in scare quotes because this API is not actually official supported and can't
// actually be accessed from a web app due to CORS. Instead, I plan to host a proxy on my Raspberry
// Pi that mirrors the data from the official API.

const stationToApiId = {
    [ids.HOBOKEN]: 'HOB',
    [ids.NEWPORT]: 'NEW',
    [ids.WTC]: 'WTC',
    [ids._33RD_ST]: '33S',
    [ids.JOURNAL_SQUARE]: 'JSQ',
    [ids.NEWARK]: 'NWK',
};

// Note: For PATH, we use the destination station as the "route" ID. This is mostly good enough:
// From a given station there may be (at most) 2 different routes going to a given destination, but
// only one of them is operating at a given time, and in the UI we want to show the data for
// whichever one is operating.
// This simplification makes it slightly tricky to figure out how to get to Hoboken when you're on
// the JOURNAL_SQUARE <-> 33RD_ST line, because sometimes this line goes to Hoboken and sometimes it
// bypasses Hoboken. I mostly don't care about this case though and think that users will be able to
// figure it out. They can disambiguate between "JSQ <-> 33S skipping HOB" and "JSQ <-> 33S via HOB"
// based on which other lines are running.
function getDeparturesFromJson(json, station, route) {
    let consideredStation = stationToApiId[station];
    let target = stationToApiId[route];

    let stationsData = json.results.filter(elem => elem.consideredStation == consideredStation);
    if (stationsData.length == 0) {
        throw new Error(`No matching stations`);
    } else if (stationsData.length > 1) {
        throw new Error(`Multiple matching stations: ${stationsData}`);
    }
    let stationData = stationsData[0];

    let messages = stationData.destinations.map(elem => elem.messages).flat();

    return messages.filter(elem => elem.target == target).map(elem => parseInt(elem.secondsToArrival));
}

function getPathApiUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('pathApi')) {
        return urlParams.get('pathApi');
    }
    return 'http://127.0.0.1:5000';
}

function getDeparturesOld(stationsRoutes) {
    return fetch(getPathApiUrl()).then(resp => {
        if (!resp.ok) {
            throw new Error(`HTTP error fetching PATH API URL: ${resp.status}`);
        }
        return resp.json();
    }).then(json => {
        var ret = [];
        for (let [station, route] of stationsRoutes) {
            ret.push({
                station: station,
                route: route,
                departures: getDeparturesFromJson(json, station, route),
                method: ids.API,
            });
        }
        return ret;
    });
}

function getDepartures(station, route) {
    return getDeparturesOld([[station, route]]).then(result => result[0].departures);
}

module.exports = {
    getDeparturesFromJson: getDeparturesFromJson,
    getDepartures: getDepartures,
};
