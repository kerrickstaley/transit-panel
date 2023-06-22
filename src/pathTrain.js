import data from './pathTrainData.json';

const allStations = new Set(Object.entries(data['routes']).map(([_, stations]) => stations).flat());

function validateOriginDestination(origin, destination) {
    if (!allStations.has(origin)) {
        throw new Error(`origin is not a valid station: ${origin}. Valid stations are: ${Array.from(allStations)}`);
    }
    if (!allStations.has(destination)) {
        throw new Error(`destination is not a valid station: ${destination}. Valid stations are: ${Array.from(allStations)}`);
    }
}

function getRoutesBetween(origin, destination) {
    validateOriginDestination(origin, destination);
    let ret = [];
    for (const [routeName, stations] of Object.entries(data['routes'])) {
        let originIdx = stations.indexOf(origin);
        let destinationIdx = stations.indexOf(destination);
        if (originIdx !== -1 && destinationIdx !== -1 && destinationIdx > originIdx) {
            ret.push(routeName);
        }
    }
    return ret;
}

function getScheduleBetween(origin, destination) {
    validateOriginDestination(origin, destination);
    let ret = {};
    for (const route of getRoutesBetween(origin, destination)) {
        for (const [day, schedule] of Object.entries(data['schedules'][route][origin])) {
            (ret[day] = ret[day] || []).push(...schedule);
        }
    }
    return ret;
}

export default {
    getRoutesBetween,
    getScheduleBetween,
};
