"use strict";

const walkTimeFromAptDoorToPathSec = 10 * 60;
const walkTimeFromAptDoorToFerrySec = 9.5 * 60;
const maxLeaveSecToShowOption = 90 * 60;

const METHOD_SCHEDULE = 'SCHEDULE';
const METHOD_API = 'API';

// Given a Luxon DateTime and a string like '8:30 AM', return a Luxon DateTime with the same date as
// the input DateTime but with the time modified to be the time expressed by the string.
function dateTimeWithModifiedTime(dateTime, timeStr) {
    let [time, ampm] = timeStr.split(' ');
    let [hourStr, minute] = time.split(':');
    let hour = parseInt(hourStr);
    if (ampm === 'AM' && hour == 12) {
        hour = 0;
    }
    if (ampm === 'PM' && hour != 12) {
        hour += 12;
    }
    var obj = dateTime.toObject();
    obj.hour = hour;
    obj.minute = minute;
    obj.second = 0;
    obj.millisecond = 0;
    return luxon.DateTime.fromObject(obj);
}

// Take a list of departure times, expressed as strings like "8:30 AM", and get the number of seconds
// from a given Date to those times. Times are interpreted as the next instance of that time, in the
// local timezone, that is not before the given Date.
function getSecUntilDepartures(date, departureTimes) {
    var DateTime = luxon.DateTime;
    var Duration = luxon.Duration;
    const datetime = DateTime.fromJSDate(date);
    return departureTimes.map(timeAmPm => {
        var departure = dateTimeWithModifiedTime(datetime, timeAmPm);
        if (departure < datetime) {
            departure += Duration.fromObject({days: 1});
        }
        var ret = (departure - datetime) / 1000;
        return ret;
    });
}

// Get number of seconds until next departure. Takes a list of departure strings, expressed as strings
// "8:30 AM" and a Date.
//
// The return value is the number of seconds until the first departure time that is not before `date`.
function getSecUntilNextDeparture(date, departureTimes) {
    return Math.min(...getSecUntilDepartures(date, departureTimes));
}


// Get number of seconds until next departure. Takes a whole-week schedule and a Date.
//
// A whole week schedule is a list of 7 lists of strings. The first sublist represents Monday, the
// second represents Tuesday, etc. Each sublist has a list of strings like "8:30 AM" (i.e. the same)
// format that getSecUntilNextDeparture expects).
//
// The return value is the number of seconds until the first departure time that is not before `date`.
function getSecUntilNextDepartureFromWeekSchedule(date, schedule) {
    var DateTime = luxon.DateTime;
    var Duration = luxon.Duration;
    const dateTime = DateTime.fromJSDate(date);
    for (let dayDelta = 0; dayDelta < 8; dayDelta += 1) {
        const futureDateTime = dateTime.plus(Duration.fromObject({days: dayDelta}));
        const daySchedule = schedule[futureDateTime.weekday - 1];
        for (const timeAmPm of daySchedule) {
            const departure = dateTimeWithModifiedTime(futureDateTime, timeAmPm);
            if (departure >= dateTime) {
                return (departure - dateTime) / 1000;
            }
        }
    }
    console.log('There were no future departures in the entire week schedule');
    return Number.NaN;
}

function getLeaveSecFromSchedule(date, departureTimes, walkTimeSec) {
    let queryDate = new Date(date * 1 + walkTimeSec * 1000);
    let leaveSec = getSecUntilNextDeparture(queryDate, departureTimes);
    return Promise.resolve({leaveSec: leaveSec, method: METHOD_SCHEDULE});
}

function getLeaveSecFromWeekSchedule(date, weekSchedule, walkTimeSec) {
    let queryDate = new Date(date * 1 + walkTimeSec * 1000);
    let leaveSec = getSecUntilNextDepartureFromWeekSchedule(queryDate, weekSchedule);
    return Promise.resolve({leaveSec: leaveSec, method: METHOD_SCHEDULE});
}

const pathApiUrl = 'https://path.api.razza.dev/v1/stations/hoboken/realtime';

// Get the number of seconds until all the upcoming PATH departures for a given list of routes and a direction.
//
// The valid values for routes and direction are defined at https://github.com/mrazza/path-data
//
// Returns a Promise holding an array of Numbers.
function getSecsUntilNextPathDeparturesFromApi(routes, direction) {
    console.log('Querying mrazza API');
    return fetch(pathApiUrl).then(resp => {
        if (!resp.ok) {
            throw new Error(`HTTP error fetching PATH API URL: ${response.status}`);
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
function getPathLeaveSecFromApi(routes, direction, walkTimeSec) {
    return getSecsUntilNextPathDeparturesFromApi(routes, direction).then(secs => {
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
    let apiPromise = getPathLeaveSecFromApi(routes, direction, walkTimeSec);
    let schedPromise = getLeaveSecFromWeekSchedule(date, weekSchedule, walkTimeSec);
    return Promise.allSettled([apiPromise, schedPromise]).then(([apiResult, schedResult]) => {
        if (apiResult.status == 'fulfilled' && apiResult.value.leaveSec != null) {
            return Promise.resolve(apiResult.value);
        } else if (apiResult.status != 'fulfilled') {
            console.log('PATH API request failed: ' + JSON.stringify(apiResult));
        }
        return Promise.resolve(schedResult.value);
    });
}

function getPathTo33rdLeaveSec() {
    return getLeaveSecFromBothApiAndWeekSchedule(['HOB_33', 'JSQ_33_HOB'], 'TO_NY', new Date(), pathHobokenTo33rdWeekSchedule, walkTimeFromAptDoorToPathSec);
}

function getWtcPathLeaveSec() {
    return getLeaveSecFromBothApiAndWeekSchedule(['HOB_WTC'], 'TO_NY', new Date(), pathHobokenToWtcWeekSchedule, walkTimeFromAptDoorToPathSec);
}

function getBrookfieldFerryLeaveSec() {
    return getLeaveSecFromWeekSchedule(new Date(), hobokenToBrookfieldFerryWeekSchedule, walkTimeFromAptDoorToFerrySec);
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
