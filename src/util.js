const luxon = require('luxon');

// Given a list of pumpDepartures functions, merge them.
// The merged result list of departures will start with all the departures from the first fn.
// Then it will include all the departures from the second fn that are after the last departure
// from the first fn. And so on.
// This has the effect of always using the departure information from the first data source, unless
// it has no departures or all its departures are too soon to catch, in which case the second data
// source will be used, etc.
function pumpDeparturesWithFallback(fns) {
    return setDepartures => {
        let allDepartures = [];
        let cancels = [];

        function mergeDepartures() {
            let ret = [];
            for (let departures of allDepartures) {
                for (let departure of departures) {
                    if (ret.length === 0 || departure.departure > ret[ret.length - 1].departure) {
                        ret.push(departure);
                    }
                }
            }
            return ret;
        }

        for (let fn of fns) {
            let departures = [];
            allDepartures.push(departures)
            // Note: We update allDepartures[i] *in-place* in this method.
            let cancel = fn(newDepartures => {
                departures.splice(0, departures.length, ...newDepartures);
                setDepartures(mergeDepartures());
            });
            cancels.push(cancel);
        }

        return () => cancels.forEach(cancel => cancel());
    }
}

// Given a Luxon DateTime and a string like '8:30 AM', return a Luxon DateTime with the same date as
// the input DateTime but with the time modified to be the time expressed by the string.
function dateTimeWithModifiedTime(dateTime, timeStr) {
    let [time, ampm] = timeStr.split(' ');
    let [hourStr, minute] = time.split(':');
    let hour = parseInt(hourStr);
    if (ampm === 'AM' && hour === 12) {
        hour = 0;
    }
    if (ampm === 'PM' && hour !== 12) {
        hour += 12;
    }
    var obj = dateTime.toObject();
    obj.hour = hour;
    obj.minute = minute;
    obj.second = 0;
    obj.millisecond = 0;
    return luxon.DateTime.fromObject(obj);
}

// Given a time string like '9:31 PM', find the next instance of that time that is after now, in
// the local timezone.
// TODO Make this independent of system timezone.
function getNextInstanceOfTime(nowJs, time) {
    let now = luxon.DateTime.fromJSDate(nowJs);
    let timeToday = dateTimeWithModifiedTime(now, time);
    if (timeToday >= now) {
        return timeToday.toJSDate();
    }

    let timeTomorrow = dateTimeWithModifiedTime(
        dateTimeWithModifiedTime(now, '12:00 PM').plus(luxon.Duration.fromObject({hours: 24})),
        time);

    return timeTomorrow.toJSDate();
}

export default {
    pumpDeparturesWithFallback,
    dateTimeWithModifiedTime,
    getNextInstanceOfTime,
};
