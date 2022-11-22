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

function getLeaveSecGeneric(station, route, walkSec, getDeparturesFuncs) {
    let promises = getDeparturesFuncs.map(f => f(station, route));
    return Promise.allSettled(promises).then(allDepartures => {
        let leaveSecs = allDepartures.flatMap(result => {
            if (result.status != 'fulfilled') {
                console.log('Promise broken: ' + JSON.stringify(result));
                return [];
            }
            let leaveSecs = result.value.departures.flatMap(d => {
                let leaveSec = d - walkSec;
                return leaveSec >= 0 ? [leaveSec] : [];
            });
            return leaveSecs.length >= 1 ? [{leaveSec: leaveSecs[0], method: result.value.method}] : [];
        });
        return leaveSecs.length >= 1 ? leaveSecs[0] : null;
    });
}

function getLeaveSecPath(station, route, walkSec) {
    return getLeaveSecGeneric(station, route, walkSec, [pathOfficial.getDepartures, schedule.getDepartures]);
}

function getLeaveSecFerry(station, route, walkSec) {
    return getLeaveSecGeneric(station, route, walkSec, [schedule.getDepartures]);
}

function getLeaveSec(station, route, walkSec) {
    let method = {
        [ids.HOBOKEN]: getLeaveSecPath,
        [ids.HOBOKEN_FERRY]: getLeaveSecFerry,
    }[station];
    return method(station, route, walkSec);
}

function getPathTo33rdLeaveSec() {
    return getLeaveSec(ids.HOBOKEN, ids._33RD_ST, walkTimeFromAptDoorToPathSec);
}

function getWtcPathLeaveSec() {
    return getLeaveSec(ids.HOBOKEN, ids.WTC, walkTimeFromAptDoorToPathSec);
}

function getBrookfieldFerryLeaveSec() {
    return getLeaveSec(ids.HOBOKEN_FERRY, ids.HOBOKEN_TO_BROOKFIELD_FERRY, walkTimeFromAptDoorToFerrySec);
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
