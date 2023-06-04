import Row from './Row.js';
import React from 'react';
import schedule from './schedule.js';
import icon from './images/at_grade_train.png';

export default function NjTransitRailRow(props) {
    let {origin, routeName, walkSec} = props;
    let routeSchedule = scheduleData[origin][routeName];
    let retProps = {
        pumpLeaveUpdates: schedule.pumpLeaveUpdatesFromSchedule(routeSchedule, walkSec),
        rowTitle: props.rowTitle ?? routeName.toUpperCase(),
        icon: props.icon ?? icon,
        backgroundColor: props.backgroundColor ?? backgroundColorData[routeName],
    };

    return React.createElement(Row, retProps);
}

let scheduleData = {
    'hoboken': {
        'bntnm': {
            // https://content.njtransit.com/sites/default/files/pdfs/rail/2023/04/230003/bntn.pdf
            // Can extract from GTFS feed
            weekend: [
                '01:15 AM',
                '06:08 AM',
                '08:08 AM',
                '10:08 AM',
                '12:08 PM',
                '02:08 PM',
                '04:08 PM',
                '06:08 PM',
                '08:08 PM',
                '11:08 PM',
            ],
            // This route runs on weekdays too, but it was confusing to extract the weekday data from the
            // GTFS data (I only got a subset of the departure times listed in the PDF, maybe because the
            // PDF lists itineraries that involve multiple routes w/ transfers between routes?). I
            // currently only take this route on weekends anyway.
            weekday: [],
        },
    },
};

let backgroundColorData = {
    // Original color is #e66859. Lightened 30% using https://pinetools.com/lighten-color
    'bntnm': '#ed958a',
};
