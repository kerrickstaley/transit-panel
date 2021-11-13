"use strict";

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
        const futureDateTime = new DateTime(dateTime + Duration.fromObject({days: dayDelta}));
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
    var queryDate = new Date(date * 1 + walkTimeSec * 1000);
    return Promise.resolve(getSecUntilNextDeparture(queryDate, departureTimes));
}

function getLeaveSecFromWeekSchedule(date, weekSchedule, walkTimeSec) {
    var queryDate = new Date(date * 1 + walkTimeSec * 1000);
    return Promise.resolve(getSecUntilNextDepartureFromWeekSchedule(queryDate, weekSchedule));
}

const pathApiUrl = 'https://path.api.razza.dev/v1/stations/hoboken/realtime';
const walkTimeFromAptDoorToPathSec = 10 * 60;

// Get the number of seconds until all the upcoming PATH departures for a given route and direction.
//
// The valid values for route and direction are defined at https://github.com/mrazza/path-data
//
// Returns a Promise holding an array of Numbers.
function getSecsUntilNextPathDeparturesFromApi(route, direction) {
    return fetch(pathApiUrl).then(resp => {
        if (!resp.ok) {
            throw new Error(`HTTP error fetching PATH API URL: ${response.status}`);
        }
        return resp.body.getReader().read();
    }).then(dataArr => {
        var data = JSON.parse(new TextDecoder().decode(dataArr.value));
        var trains = data.upcomingTrains.filter(
            train => train.route == route && train.direction == direction
        );
        return trains.map(train => (Date.parse(train.projectedArrival) - new Date()) / 1000);
    });
}

// Returns a promise with the number of seconds until you must leave to catch the next PATH train,
// using the API at https://path.api.razza.dev/
function getPathLeaveSecFromApi(route, direction) {
    return getSecsUntilNextPathDeparturesFromApi(route, direction).then(secs => {
        for (const sec of secs) {
            const leaveSec = sec - walkTimeFromAptDoorToPathSec;
            if (leaveSec >= 0) {
                return leaveSec;
            }
        }
    });
}

function getPathTo33rdLeaveSec() {
    return getLeaveSecFromWeekSchedule(new Date(), pathHobokenTo33rdWeekSchedule, walkTimeFromAptDoorToPathSec);
}

function getWtcPathLeaveSec() {
    return getLeaveSecFromSchedule(new Date(), hobokenToWtcPathWeekdayDepartureTimes, walkTimeFromAptDoorToPathSec);
}

const walkTimeFromAptDoorToFerrySec = 9.5 * 60;

function getBrookfieldFerryLeaveSec() {
    return getLeaveSecFromSchedule(new Date(), hobokenToBrookfieldFerryWeekdayDepartureTimes, walkTimeFromAptDoorToFerrySec);
}

// Display remaining minutes before you need to leave in order to catch a given transit option.
//
// Runs the function to compute the remaining time (returned as a Promise), displays that value
// in the given div, then calls setTimeout to run the update again when the value changes.
function displayLeaveMinUpdateLoop(divId, leaveSecFunc) {
    const secPerMin = 60;  // Can set this to 1 to see the value update every second for testing.
    leaveSecFunc().then(leaveSec => {
        let leaveMin = Math.floor(leaveSec / secPerMin);
        // This is probably poor style.
        document.getElementById(divId).innerHTML = leaveMin;
        // + .1 is a little hack to make sure that the minute has definitely rolled over by the time we get there.
        setTimeout(() => displayLeaveMinUpdateLoop(divId, leaveSecFunc),
                   (((leaveSec % secPerMin) + secPerMin) % secPerMin + .1) * 1000);
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
displayLeaveMinUpdateLoop('brookfield-ferry-leave-in-min', getBrookfieldFerryLeaveSec);
displayLeaveMinUpdateLoop('wtc-path-leave-in-min', getWtcPathLeaveSec);
displayLeaveMinUpdateLoop('path-to-33rd-leave-in-min', getPathTo33rdLeaveSec);
addFullscreenButton();
