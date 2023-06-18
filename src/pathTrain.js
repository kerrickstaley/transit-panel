import data from './pathTrainData.json';

function getRoutesBetween(origin, destination) {
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
