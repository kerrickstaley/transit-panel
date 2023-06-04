// This fetches from mrazza's API; see https://github.com/mrazza/path-data

const routeToApiDirectionAndRoutes = {
    'world_trade_center': {
        direction: 'TO_NY',
        routes: ['HOB_WTC', 'NWK_WTC'],
    },
    'hoboken': {
        direction: 'TO_NJ',
        routes: ['HOB_WTC', 'HOB_33'],
    },
    'thirty_third_street': {
        direction: 'TO_NY',
        routes: ['HOB_33', 'JSQ_33', 'JSQ_33_HOB'],
    },
    'newark': {
        direction: 'TO_NJ',
        routes: ['NWK_WTC'],
    },
    'journal_square': {
        direction: 'TO_NJ',
        routes: ['JSQ_33', 'JSQ_33_HOB'],
    }
};

function stationUrl(stationId) {
    return `https://path.api.razza.dev/v1/stations/${stationId}/realtime`;
}

function getDeparturesFromJson(json, route) {
    const {direction, routes} = routeToApiDirectionAndRoutes[route];
    return json.upcomingTrains
        .filter(train => direction == train.direction && routes.includes(train.route))
        .map(train => new Date(train.projectedArrival));
}

function getDepartures(origin, route) {
    return fetch(stationUrl(origin))
        .then(resp => resp.json())
        .then(json => getDeparturesFromJson(json, route));
}

function pumpLeaveUpdates(origin, route, walkSec) {
    return setLeaveUpdates => {
        let loopTimeoutId = null;

        function loop() {
            getDepartures(origin, route).then(departures => {
                let now = new Date();
                let updates = departures.map(departure => ({
                    leaveTime: new Date(departure / 1 - walkSec * 1000),
                    methodAbbrev: 'API',
                })).filter(update => update.leaveTime >= now);
                setLeaveUpdates(updates);
            });

            // TODO this can be more efficient
            loopTimeoutId = setTimeout(loop, 60 * 1000);
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
    pumpLeaveUpdates,
};
