"use strict";

var newport_pkwy_station_id = '3199';
var station_status_url = 'https://gbfs.citibikenyc.com/gbfs/en/station_status.json';

// var request = new XMLHttpRequest();
// request.open('GET', station_status_url, true);
// request.onload = function() {
//     var data = JSON.parse(request.response);
//     var station_status = data.data.stations.find(
//         el => el.station_id === newport_pkwy_station_id
//     );
//     document.querySelector('body').innerHTML = 'Bikes available: ' + station_status.num_bikes_available;
// };
// request.send();

// var request2 = new XMLHttpRequest();
// request2.open('GET', 'https://path.api.razza.dev/v1/stations/hoboken/realtime');
// request2.onload = function() {
//     var data = JSON.parse(request2.response);
//     console.log(data);
// };
// request2.send();

const pathApiUrl = 'https://path.api.razza.dev/v1/stations/hoboken/realtime';
const walkTimeFromAptDoorToPathSec = 11 * 60;

// Get the number of seconds until all the upcoming PATH departures for a given route and direction.
//
// The valid values for route and direction are defined at https://github.com/mrazza/path-data
//
// Returns a Promise holding an array of Numbers.
function getSecsUntilNextPathDepartures(route, direction) {
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

// Returns a promise with the number of seconds until you must leave to catch the next PATH train.
function getPathLeaveSec(route, direction) {
    return getSecsUntilNextPathDepartures(route, direction).then(secs => {
        for (const sec of secs) {
            const leaveSec = sec - walkTimeFromAptDoorToPathSec;
            if (leaveSec >= 0) {
                return leaveSec;
            }
        }
    });
}

function get33StPathLeaveSec() {
    return getPathLeaveSec('JSQ_33_HOB', 'TO_NY');
}

function getWtcPathLeaveSec() {
    return getPathLeaveSec('HOB_WTC', 'TO_NY');
}

// https://www.nywaterway.com/HobokenNJTT-WFCRoute.aspx#weekday
const hobokenToBrookfieldWeekdayDepartureTimes = [
    '6:05 AM',
    '6:20 AM',
    '6:40 AM',
    '7:00 AM',
    '7:20 AM',
    '7:40 AM',
    '8:00 AM',
    '8:20 AM',
    '8:40 AM',
    '9:00 AM',
    '9:20 AM',
    '9:40 AM',
    '10:00 AM',
    '10:20 AM',
    '10:40 AM',
    '11:00 AM',
    '11:20 AM',
    '11:40 AM',
    '12:00 PM',
    '12:20 PM',
    '12:40 PM',
    '1:00 PM',
    '1:20 PM',
    '1:40 PM',
    '2:00 PM',
    '2:20 PM',
    '2:40 PM',
    '3:00 PM',
    '3:20 PM',
    '3:40 PM',
    '4:00 PM',
    '4:20 PM',
    '4:40 PM',
    '5:00 PM',
    '5:20 PM',
    '5:40 PM',
    '6:00 PM',
    '6:20 PM',
    '6:40 PM',
    '7:00 PM',
];

const walkTimeFromAptDoorToFerrySec = 10 * 60;

// Take a list of departure times, expressed as strings like "8:30 AM", and get the number of seconds
// from a given Date to those times. Times are interpreted as the next instance of that time, in the
// local timezone, that is not before the given Date.
function getSecUntilDepartures(date, departureTimes) {
    var DateTime = luxon.DateTime;
    var Duration = luxon.Duration;
    const datetime = DateTime.fromJSDate(date);
    return departureTimes.map(time_ampm => {
        let [time, ampm] = time_ampm.split(' ');
        let [hour_str, minute] = time.split(':');
        let hour = parseInt(hour_str);
        if (ampm === 'AM' && hour == 12) {
            hour = 0;
        }
        if (ampm === 'PM' && hour != 12) {
            hour += 12;
        }
        var obj = datetime.toObject();
        obj.hour = hour;
        obj.minute = minute;
        obj.second = 0;
        obj.millisecond = 0;
        var departure = DateTime.fromObject(obj);
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

function getFerryLeaveSec(date, departureTimes, walkTimeSec) {
    var queryDate = new Date(date * 1 + walkTimeSec * 1000);
    return Promise.resolve(getSecUntilNextDeparture(queryDate, departureTimes));
}

function getBrookfieldFerryLeaveSec() {
    return getFerryLeaveSec(new Date(), hobokenToBrookfieldWeekdayDepartureTimes, walkTimeFromAptDoorToFerrySec);
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
addFullscreenButton();
