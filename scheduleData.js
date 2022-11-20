"use strict";

// TODO: why can't I require scheduleData.json5 using the instructions at https://json5.org/?
const data = require('./scheduleData.json');
const ids = require('./ids');

const hobokenToBrookfieldFerryWeekSchedule = [
    data.hobokenToBrookfieldFerry.weekday,
    data.hobokenToBrookfieldFerry.weekday,
    data.hobokenToBrookfieldFerry.weekday,
    data.hobokenToBrookfieldFerry.weekday,
    data.hobokenToBrookfieldFerry.weekday,
    data.hobokenToBrookfieldFerry.saturday,
    data.hobokenToBrookfieldFerry.sunday,
];

const pathHobokenToWtcWeekSchedule = [
    data.pathHobokenToWtc.weekday,
    data.pathHobokenToWtc.weekday,
    data.pathHobokenToWtc.weekday,
    data.pathHobokenToWtc.weekday,
    data.pathHobokenToWtc.weekday,
    data.pathHobokenToWtc.saturday,
    data.pathHobokenToWtc.sunday,
];

const pathHobokenTo33rdWeekSchedule = [
    data.pathHobokenTo33rd.weekday,
    data.pathHobokenTo33rd.weekday,
    data.pathHobokenTo33rd.weekday,
    data.pathHobokenTo33rd.weekday,
    data.pathHobokenTo33rd.weekday,
    data.pathHobokenTo33rd.saturday,
    data.pathHobokenTo33rd.sunday,
];

const idsToWeekSchedule = {
    [ids.HOBOKEN]: {
        [ids.WTC]: pathHobokenToWtcWeekSchedule,
        [ids._33RD_ST]: pathHobokenTo33rdWeekSchedule,
    }
};

module.exports = {
    hobokenToBrookfieldFerryWeekSchedule: hobokenToBrookfieldFerryWeekSchedule,
    pathHobokenToWtcWeekSchedule: pathHobokenToWtcWeekSchedule,
    pathHobokenTo33rdWeekSchedule: pathHobokenTo33rdWeekSchedule,
    idsToWeekSchedule: idsToWeekSchedule,
};
