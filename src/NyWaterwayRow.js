import Row from './Row.js';
import React from 'react';
import schedule from './schedule.js';
import ferryIcon from './images/ferry.png';

export default function NyWaterwayRow(props) {
    let {origin, destination, walkSec} = props;
    let routeSchedule = scheduleData[origin][destination];
    let destinationCap = destination[0].toUpperCase() + destination.slice(1);
    let retProps = {
        pumpLeaveUpdates: schedule.pumpLeaveUpdates(routeSchedule, walkSec),
        title: props.title ?? `Ferry to ${destinationCap}`,
        icon: props.icon ?? ferryIcon,
        backgroundColor: props.backgroundColor ?? '#d0e0e3',
    };

    return React.createElement(Row, retProps);
}

let scheduleData = {
    'hoboken': {
        'brookfield': {
            weekday: [
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
            ],
            // This ferry does run on the weekend, but I never take it, so the schedule is empty here.
            'weekend':  [],
        }
    }
};
