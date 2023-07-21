// TODO: We don't even attempt to handle timezones. The app basically doesn't work outside the
// Eastern timezone.

import util from './util.js';
const luxon = require('luxon');

// Given a schedule with keys like 'monday', 'tuesday', 'weekday', 'weekend' and a dayIdx, return
// the schedule for that day. 0 <= dayIdx < 7, 0 is Monday and 6 is Sunday.
function getDaySchedule(schedule, dayIdx) {
    let specificWeekday = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][dayIdx];
    let weekdayOrWeekend = dayIdx <= 4 ? 'weekday' : 'weekend';

    if (schedule.hasOwnProperty(specificWeekday)) {
        return schedule[specificWeekday];
    }

    if (schedule.hasOwnProperty(weekdayOrWeekend)) {
        return schedule[weekdayOrWeekend];
    }
    
    throw new Error(`Could not find day with index ${dayIdx} in ${JSON.stringify(schedule)}`);
}

// Get next n departures that are >= the given date from the given schedule
// Schedule is an object with keys like 'monday', 'tuesday', 'weekday', 'weekend'
// Values are sorted lists of departure times on those days of the week, e.g. ['8:30 AM', '5:30 PM']
// TODO support "dayRollover" setting
function getNextDeparturesFromSchedule(schedule, date, n = 1) {
    const DateTime = luxon.DateTime;
    const Duration = luxon.Duration;
    const dateTime = DateTime.fromJSDate(date);
    let ret = [];

    for (let dayDelta = 0; ret.length < n; dayDelta += 1) {
        const futureDateTime = dateTime.plus(Duration.fromObject({days: dayDelta}));
        const daySchedule = getDaySchedule(schedule, futureDateTime.weekday - 1);
        for (let time of daySchedule) {
            let departureTime = util.dateTimeWithModifiedTime(futureDateTime, time);
            if (departureTime >= date) {
                ret.push(departureTime);

                if (ret.length >= n) {
                    break;
                }
            }
        }
    }

    return ret;
}

// Returns a new copy, does not modify the original.
function sortSingleDaySchedule(singleDaySchedule) {
    let ret = [...singleDaySchedule];
    const DateTime = luxon.DateTime;
    let toDateTime = timeStr => DateTime.fromFormat('2023-01-01 ' + timeStr, 'yyyy-MM-dd h:mm a');
    ret.sort((a, b) => {
        let aDateTime = toDateTime(a);
        let bDateTime = toDateTime(b);
        if (aDateTime === bDateTime) {
            return 0;
        }
        return aDateTime < bDateTime ? -1 : 1;
    });
    return ret;
}

// Returns a new copy, does not modify the original.
function sortSchedule(schedule) {
    let ret = {};
    Object.keys(schedule).forEach((key, _) => {
        ret[key] = sortSingleDaySchedule(schedule[key]);
    });
    return ret;
}

// For this function, schedule does not need to be sorted; we will sort it.
function pumpDepartures(schedule) {
    schedule = sortSchedule(schedule);
    return setDepartures => {
        let loopTimeoutId = null;

        function loop() {
            // TODO use walkSec hint instead of just hardcoding 4 here
            let departures = getNextDeparturesFromSchedule(
                schedule, new Date(), 4);
            let updates = departures.map(departure => ({
                departure: departure.toJSDate(),
                methodAbbrev: 'SCH',
            }));

            setDepartures(updates);
            // TODO this can be more efficient
            loopTimeoutId = setTimeout(loop, 120 * 1000);
        }

        function cancel() {
            clearTimeout(loopTimeoutId);
        }

        loop();
        return cancel;
    };
};

export default {
    getNextDeparturesFromSchedule,
    pumpDepartures,
};
