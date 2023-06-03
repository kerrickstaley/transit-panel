"use strict";

import data from './scheduleData.json5';
import ids from './ids.js';

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

const pathWtcToHobokenWeekSchedule = [
    data.pathWtcToHoboken.weekday,
    data.pathWtcToHoboken.weekday,
    data.pathWtcToHoboken.weekday,
    data.pathWtcToHoboken.weekday,
    data.pathWtcToHoboken.weekday,
    data.pathWtcToHoboken.saturday,
    data.pathWtcToHoboken.sunday,
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

const njTransitBntnmWeekSchedule = [
    [],
    [],
    [],
    [],
    [],
    data.njTransitBntnm.weekend,
    data.njTransitBntnm.weekend,
];

const idsToWeekSchedule = {
    [ids.HOBOKEN]: {
        [ids.WTC]: pathHobokenToWtcWeekSchedule,
        [ids._33RD_ST]: pathHobokenTo33rdWeekSchedule,
    },
    [ids.WTC]: {
        [ids.HOBOKEN]: pathWtcToHobokenWeekSchedule,
    },
    [ids.HOBOKEN_FERRY]: {
        [ids.HOBOKEN_TO_BROOKFIELD_FERRY]: hobokenToBrookfieldFerryWeekSchedule,
    },
    [ids.HOBOKEN_NJ_TRANSIT_RAIL]: {
        [ids.NJ_TRANSIT_BNTNM]: njTransitBntnmWeekSchedule,
    },
};

export default {
    hobokenToBrookfieldFerryWeekSchedule,
    pathHobokenToWtcWeekSchedule,
    pathHobokenTo33rdWeekSchedule,
    idsToWeekSchedule,
};
