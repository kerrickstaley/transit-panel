// This fetches from mrazza's API; see https://github.com/mrazza/path-data
import pathTrain from './pathTrain.js';

function routeToApiRouteAndDirection(route) {
    return {
        hobokenToThirtyThirdStreet: {
            route: 'HOB_33',
            direction: 'TO_NY',
        },
        hobokenToWorldTradeCenter: {
            route: 'HOB_WTC',
            direction: 'TO_NY',
        },
        journalSquareToThirtyThirdStreet: {
            route: 'JSQ_33',
            direction: 'TO_NY',
        },
        journalSquareToThirtyThirdStreetViaHoboken: {
            route: 'JSQ_33_HOB',
            direction: 'TO_NY',
        },
        newarkToWorldTradeCenter: {
            route: 'NWK_WTC',
            direction: 'TO_NY',
        },
        thirtyThirdStreetToHoboken: {
            route: 'HOB_33',
            direction: 'TO_NJ',
        },
        thirtyThirdStreetToJournalSquare: {
            route: 'JSQ_33',
            direction: 'TO_NJ',
        },
        thirtyThirdStreetToJournalSquareViaHoboken: {
            route: 'JSQ_33_HOB',
            direction: 'TO_NJ',
        },
        worldTradeCenterToHoboken: {
            route: 'HOB_WTC',
            direction: 'TO_NJ',
        },
        worldTradeCenterToNewark: {
            route: 'NWK_WTC',
            direction: 'TO_NJ',
        },
    }[route];
}

function stationToApiStation(station) {
    // https://stackoverflow.com/a/54246501
    return station.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}


function stationUrl(station) {
    return `https://path.api.razza.dev/v1/stations/${stationToApiStation(station)}/realtime`;
}

function getDeparturesFromJson(json, routes) {
    const apiRoutesAndDirections = routes.map(routeToApiRouteAndDirection);
    return json.upcomingTrains
        .filter(train => apiRoutesAndDirections.some(
            ({route, direction}) => train.route === route && train.direction === direction))
        .map(train => ({
            // It says "arrival" but actually seems to be a departure time?
            departure: new Date(train.projectedArrival),
            methodAbbrev: 'API',
        }));
}

function getDepartures(origin, routes) {
    return fetch(stationUrl(origin))
        .then(resp => resp.json())
        .then(json => getDeparturesFromJson(json, routes));
}

function pumpDepartures(origin, destination) {
    return setDepartures => {
        let routes = pathTrain.getRoutesBetween(origin, destination);
        let loopTimeoutId = null;

        function loop() {
            getDepartures(origin, routes).then(setDepartures);

            // TODO this can be more efficient
            loopTimeoutId = setTimeout(loop, (40 + 5 * Math.random()) * 1000);
        }

        function cancel() {
            clearTimeout(loopTimeoutId);
        }

        loop();
        return cancel;
    };
}

export default {
    getDeparturesFromJson,
    getDepartures,
    pumpDepartures,
};
