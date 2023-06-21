import Row from './Row.js';
import React from 'react';
import schedule from './schedule.js';
import ferryIcon from './images/ferry.png';
import data from './nyWaterwayData.json';

export default function NyWaterwayRow(props) {
    let {origin, destination, walkSec} = props;
    let routeSchedule = data['schedules'][origin][destination];
    let destinationCap = destination[0].toUpperCase() + destination.slice(1);
    let retProps = {
        pumpLeaveUpdates: schedule.pumpLeaveUpdates(routeSchedule, walkSec),
        title: props.title ?? `Ferry to ${destinationCap}`,
        icon: props.icon ?? ferryIcon,
        backgroundColor: props.backgroundColor ?? '#d0e0e3',
    };

    return React.createElement(Row, retProps);
}
