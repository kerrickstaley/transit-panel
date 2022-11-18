"use strict";

const schedule = require('./schedule');
const scheduleData = require('./scheduleData');
const pathOfficial = require('./pathOfficial');
const ids = require('./ids');

const walkTimeFromAptDoorToPathSec = 10 * 60;
const walkTimeFromAptDoorToFerrySec = 9.5 * 60;
const maxLeaveSecToShowOption = 90 * 60;

const METHOD_SCHEDULE = 'SCHEDULE';
const METHOD_API = 'API';


const mrazzaPathApiUrl = 'https://path.api.razza.dev/v1/stations/hoboken/realtime';

// Get the number of seconds until all the upcoming PATH departures for a given list of routes and a direction.
//
// The valid values for routes and direction are defined at https://github.com/mrazza/path-data
//
// Returns a Promise holding an array of Numbers.
function getSecsUntilNextPathDeparturesFromMrazzaApi(routes, direction) {
    console.log('Querying mrazza API');
    return fetch(mrazzaPathApiUrl).then(resp => {
        if (!resp.ok) {
            throw new Error(`HTTP error fetching PATH API URL: ${resp.status}`);
        }
        return resp.body.getReader().read();
    }).then(dataArr => {
        var data = JSON.parse(new TextDecoder().decode(dataArr.value));
        var trains = data.upcomingTrains.filter(
            train => routes.includes(train.route) && train.direction == direction
        );
        return trains.map(train => (Date.parse(train.projectedArrival) - new Date()) / 1000);
    });
}

// Returns a promise with the number of seconds until you must leave to catch the next PATH train,
// using the API at https://path.api.razza.dev/
function getPathLeaveSecFromMrazzaApi(routes, direction, walkTimeSec) {
    return getSecsUntilNextPathDeparturesFromMrazzaApi(routes, direction).then(secs => {
        for (const sec of secs) {
            const leaveSec = sec - walkTimeSec;
            if (leaveSec >= 0) {
                return {leaveSec: leaveSec, method: METHOD_API};
            } else {
                console.log('Skipping PATH API option because not enough time until departure: ' + sec + ' seconds');
            }
        }
        return {leaveSec: null, method: METHOD_API};
    });
}

// This function uses the API and falls back to the schedule if the API is unavailable
// (e.g. because there is no train far enough in the future, or the API is down).
function getLeaveSecFromBothApiAndWeekSchedule(routes, direction, date, weekSchedule, walkTimeSec) {
    let apiPromise = getPathLeaveSecFromMrazzaApi(routes, direction, walkTimeSec);
    let schedPromise = schedule.getLeaveSecFromWeekSchedule(date, weekSchedule, walkTimeSec);
    return Promise.allSettled([apiPromise, schedPromise]).then(([apiResult, schedResult]) => {
        if (apiResult.status == 'fulfilled' && apiResult.value.leaveSec != null) {
            return Promise.resolve(apiResult.value);
        } else if (apiResult.status != 'fulfilled') {
            console.log('PATH API request failed: ' + JSON.stringify(apiResult));
        }
        return Promise.resolve(schedResult.value);
    });
}

function getLeaveSec(station, route, walkSec, getDeparturesFuncs) {
    let promises = getDeparturesFuncs.map(f => f(station, route));
    return Promise.allSettled(promises).then(allDepartures => {
        let leaveSecs = allDepartures.flatMap(result => {
            let leaveSecs = result.value.departures.flatMap(d => {
                let leaveSec = d - walkSec;
                return leaveSec >= 0 ? [leaveSec] : [];
            });
            return leaveSecs.length >= 1 ? [{leaveSec: leaveSecs[0], method: result.value.method}] : [];
        });
        return leaveSecs.length >= 1 ? leaveSecs[0] : null;
    });
}

// TODO remove testing code
getLeaveSec(ids.HOBOKEN, ids._33RD_ST, walkTimeFromAptDoorToPathSec, [pathOfficial.getDepartures, schedule.getDepartures]).then(console.log);

function getPathTo33rdLeaveSec() {
    return getLeaveSec(ids.HOBOKEN, ids._33RD_ST, walkTimeFromAptDoorToPathSec, [pathOfficial.getDepartures, schedule.getDepartures]);
}

function getWtcPathLeaveSec() {
    return getLeaveSec(ids.HOBOKEN, ids.WTC, walkTimeFromAptDoorToPathSec, [pathOfficial.getDepartures, schedule.getDepartures]);
}

function getBrookfieldFerryLeaveSec() {
    return schedule.getLeaveSecFromWeekSchedule(new Date(), scheduleData.hobokenToBrookfieldFerryWeekSchedule, walkTimeFromAptDoorToFerrySec);
}

function methodAbbrev(method) {
    return method.substr(0, 3);
}

// Display remaining minutes before you need to leave in order to catch a given transit option.
//
// Runs the function to compute the remaining time (returned as a Promise), displays that value
// in the given div, then calls setTimeout to run the update again when the value changes.
function displayLeaveMinUpdateLoop(rowId, leaveSecFunc) {
    const secPerMin = 60;  // Can set this to 1 to see the value update every second for testing.
    leaveSecFunc().then(({leaveSec, method}) => {
        let row = document.getElementById(rowId);
        if (leaveSec < maxLeaveSecToShowOption) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
        let leaveMin = Math.floor(leaveSec / secPerMin);
        // This is probably poor style.
        row.querySelector('.leave-in-min').innerHTML = leaveMin;
        let methodDiv = row.querySelector('.method');
        if (methodDiv !== null) {
            methodDiv.innerHTML = methodAbbrev(method);
        }
        let sleepSec = ((leaveSec % secPerMin) + secPerMin) % secPerMin;
        if (method == METHOD_SCHEDULE) {
            // + .1 is a little hack to make sure that the minute has definitely rolled over by the time we get there.
            sleepSec += .1;
        } else if (method == METHOD_API) {
            sleepSec = Math.min(30, sleepSec + 5);
        } else {
            console.log('unreachable');
            return;
        }
        sleepSec = Math.max(10, sleepSec);  // Avoid hitting the API too much
        setTimeout(() => displayLeaveMinUpdateLoop(rowId, leaveSecFunc), sleepSec * 1000);
    });
}

function addFullscreenButton() {
    var button = document.createElement('button');
    button.innerHTML = 'Click to go fullscreen';
    document.body.appendChild(button);
    button.onclick = el => {
        document.querySelector('body').requestFullscreen().catch(err => {
            alert('Unable to fullscreen: ' + err.message);
        });
        button.style['display'] = 'none';
    };
}

// Used for demos.
function getRandomLeaveSec(maxMin) {
    return () => Promise.resolve(maxMin * 60 * Math.random());
}

displayLeaveMinUpdateLoop('ferry-to-brookfield-row', getBrookfieldFerryLeaveSec);
displayLeaveMinUpdateLoop('path-to-wtc-row', getWtcPathLeaveSec);
displayLeaveMinUpdateLoop('path-to-33rd-row', getPathTo33rdLeaveSec);
addFullscreenButton();
