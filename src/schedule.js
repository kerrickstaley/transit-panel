"use strict";

import scheduleData from './scheduleData.js';
import ids from './ids.js';
const luxon = require('luxon');

// TODO remove this redundant defintion, this is terrible
const METHOD_SCHEDULE = 'SCHEDULE';

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
function getSecsUntilNextDeparturesFromWeekSchedule(date, schedule, n) {
    var DateTime = luxon.DateTime;
    var Duration = luxon.Duration;
    const dateTime = DateTime.fromJSDate(date);
    let ret = [];
    for (let dayDelta = 0; dayDelta < 8; dayDelta += 1) {
        const futureDateTime = dateTime.plus(Duration.fromObject({days: dayDelta}));
        const daySchedule = schedule[futureDateTime.weekday - 1];
        for (const timeAmPm of daySchedule) {
            const departure = dateTimeWithModifiedTime(futureDateTime, timeAmPm);
            if (departure >= dateTime) {
                ret.push((departure - dateTime) / 1000);
                if (ret.length >= n) {
                    return ret;
                }
            }
        }
    }
    console.log('There were not enough future departures in the entire week schedule');
    return ret;
}

function getLeaveSecFromSchedule(date, departureTimes, walkTimeSec) {
    let queryDate = new Date(date * 1 + walkTimeSec * 1000);
    let leaveSec = getSecUntilNextDeparture(queryDate, departureTimes);
    return Promise.resolve({leaveSec: leaveSec, method: METHOD_SCHEDULE});
}

function getLeaveSecFromWeekSchedule(date, weekSchedule, walkTimeSec) {
    let queryDate = new Date(date * 1 + walkTimeSec * 1000);
    let leaveSec = getSecsUntilNextDeparturesFromWeekSchedule(queryDate, weekSchedule, 1)[0];
    return Promise.resolve({leaveSec: leaveSec, method: METHOD_SCHEDULE});
}

function getDeparturesFromTime(stationsRoutes, now, n) {
    let ret = [];
    for (let [station, route] of stationsRoutes) {
        let schedule = scheduleData.idsToWeekSchedule[station][route];
        let departures = getSecsUntilNextDeparturesFromWeekSchedule(now, schedule, n);
        ret.push({
            station: station,
            route: route,
            departures: departures,
            method: ids.SCHEDULE,
        });
    }
    return ret;
}

// TODO: Can we directly test this API? Seems like there's no way to get the value out of a
// Promise that we know is resolved.
function getDeparturesOld(stationsRoutes, now = null) {
    if (now === null) {
        now = new Date();
    }
    return Promise.resolve(getDeparturesFromTime(stationsRoutes, now, 3));
}

function getDepartures(station, route) {
    return getDeparturesOld([[station, route]]).then(result => {
        return {
            departures: result[0].departures,
            method: ids.SCHEDULE,
        };
    });
}

export default {
    getSecsUntilNextDeparturesFromWeekSchedule,
    getSecUntilDepartures,
    getLeaveSecFromWeekSchedule,
    getDeparturesFromTime,
    getDepartures,
};
