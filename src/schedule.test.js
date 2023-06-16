import schedule from './schedule.js';
import sinon from 'sinon';

let clock = null;
afterEach(() => {
    if (clock != null) {
        clock.restore();
        clock = null;
    }
});

function getLeaveUpdates(scheduleData, walkSec, nowStr, n = 1) {
    let ret = null;
    clock = sinon.useFakeTimers({now: new Date(nowStr)});
    expect(new Date()).toEqual(new Date(nowStr));
    // note the () at the end which cancels the pump loop
    schedule.pumpLeaveUpdates(scheduleData, walkSec, n)(updates => ret = updates)();
    return ret;
}

test('getLeaveUpdates basic', () => {
    let scheduleData = {
        'sunday': ['10:10 PM', '10:30 PM', '10:50 PM'],
    };
    let leaveUpdates = getLeaveUpdates(scheduleData, 10 * 60, '2023-06-04T22:05-04:00', 2);
    expect(leaveUpdates).toEqual([
        {leaveTime: new Date('2023-06-04T22:20-04:00'), methodAbbrev: 'SCH'},
        {leaveTime: new Date('2023-06-04T22:40-04:00'), methodAbbrev: 'SCH'},
    ]);
});

test('getLeaveUpdates across day boundary', () => {
    let scheduleData = {
        'friday': ['10:00 PM', '11:00 PM'],
        'weekend': ['5:00 AM'],
    };
    let leaveUpdates = getLeaveUpdates(scheduleData, 10 * 60, '2023-06-02T22:30-04:00', 1);
    expect(leaveUpdates).toEqual([
        {leaveTime: new Date('2023-06-02T22:50-04:00'), methodAbbrev: 'SCH'},
        {leaveTime: new Date('2023-06-03T04:50-04:00'), methodAbbrev: 'SCH'},
    ]);
});
