const ids = require('./ids');

// This fetches from mrazza's API; see https://github.com/mrazza/path-data

const stationToApiId = {
    [ids.HOBOKEN]: 'hoboken',
    [ids.NEWPORT]: 'newport',
    [ids.WTC]: 'world_trade_center',
    [ids._33RD_ST]: 'thirty_third_street',
    [ids.JOURNAL_SQUARE]: 'journal_square',
    [ids.NEWARK]: 'newark',
};

const routeToApiDirectionAndRoutes = {
    [ids.WTC]: {
        direction: 'TO_NY',
        routes: ['HOB_WTC', 'NWK_WTC'],
    },
    [ids.HOBOKEN]: {
        direction: 'TO_NJ',
        routes: ['HOB_WTC', 'HOB_33'],
    },
    [ids._33RD_ST]: {
        direction: 'TO_NY',
        routes: ['HOB_33', 'JSQ_33', 'JSQ_33_HOB'],
    },
    [ids.NEWARK]: {
        direction: 'TO_NJ',
        routes: ['NWK_WTC'],
    },
    [ids.JOURNAL_SQUARE]: {
        direction: 'TO_NJ',
        routes: ['JSQ_33', 'JSQ_33_HOB'],
    }
};

function stationUrl(stationId) {
    return `https://path.api.razza.dev/v1/stations/${stationToApiId[stationId]}/realtime`;
}

function getDeparturesFromJson(json, route, now) {
    const {direction, routes} = routeToApiDirectionAndRoutes[route];
    return json.upcomingTrains
        .filter(train => direction == train.direction && routes.includes(train.route))
        .map(train => (new Date(train.projectedArrival) - now) / 1000)
        .filter(secs => secs >= 0);
}

function getDepartures(station, route) {
    let now = new Date();
    return fetch(stationUrl(station))
        .then(resp => resp.json())
        .then(json => ({
            departures: getDeparturesFromJson(json, route, now),
            method: ids.API,
        }));
}

module.exports = {
    getDeparturesFromJson: getDeparturesFromJson,
    getDepartures: getDepartures,
};
