import schedule from './schedule.js';
import sinon from 'sinon';

let clock = null;
afterEach(() => {
    if (clock != null) {
        clock.restore();
        clock = null;
    }
});

function getDepartures(scheduleData, nowStr) {
    let ret = null;
    clock = sinon.useFakeTimers({now: new Date(nowStr)});
    expect(new Date()).toEqual(new Date(nowStr));
    // note the () at the end which cancels the pump loop
    schedule.pumpDepartures(scheduleData)(updates => ret = updates)();
    return ret;
}

test('getDepartures basic', () => {
    let scheduleData = {
        'sunday': ['10:10 PM', '10:30 PM', '10:50 PM', '11:10 PM', '11:30 PM'],
    };
    let departures = getDepartures(scheduleData, '2023-06-04T22:15-04:00');
    expect(departures).toEqual([
        {departure: new Date('2023-06-04T22:30-04:00'), methodAbbrev: 'SCH'},
        {departure: new Date('2023-06-04T22:50-04:00'), methodAbbrev: 'SCH'},
        {departure: new Date('2023-06-04T23:10-04:00'), methodAbbrev: 'SCH'},
        {departure: new Date('2023-06-04T23:30-04:00'), methodAbbrev: 'SCH'},
    ]);
});

test('getDepartures across day boundary', () => {
    let scheduleData = {
        'friday': ['10:00 PM', '11:00 PM'],
        'weekend': ['5:00 AM', '6:00 AM', '7:00 AM'],
    };
    let departures = getDepartures(scheduleData, '2023-06-02T22:30-04:00');
    expect(departures).toEqual([
        {departure: new Date('2023-06-02T23:00-04:00'), methodAbbrev: 'SCH'},
        {departure: new Date('2023-06-03T05:00-04:00'), methodAbbrev: 'SCH'},
        {departure: new Date('2023-06-03T06:00-04:00'), methodAbbrev: 'SCH'},
        {departure: new Date('2023-06-03T07:00-04:00'), methodAbbrev: 'SCH'},
    ]);
});
