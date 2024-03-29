import Row from './Row.js';
import React from 'react';
import schedule from './schedule.js';
import ferryIcon from './images/ferry.png';
import data from './nyWaterwayData.json';

export default function NyWaterwayRow(props) {
    let {origin, destination, walkMinutes} = props;
    if (!data['schedules'].hasOwnProperty(origin)) {
        return <Row configError={
            `Invalid NY Waterway origin: ${origin}. Valid origins are: ${Object.keys(data['schedules'])}`
        } />
    }
    if (!data['schedules'][origin].hasOwnProperty(destination)) {
        return <Row configError={
            `Invalid NY Waterway destination for ${origin}: ${destination}. Valid destinations for this origin are: ${Object.keys(data['schedules'][origin])}`
        } />
    }
    let routeSchedule = data['schedules'][origin][destination];
    let destinationCap = destination[0].toUpperCase() + destination.slice(1);
    let retProps = {
        pumpDepartures: schedule.pumpDepartures(routeSchedule),
        title: props.title ?? `Ferry to ${destinationCap}`,
        icon: props.icon ?? ferryIcon,
        backgroundColor: props.backgroundColor ?? '#d0e0e3',
        walkMinutes,
    };

    return React.createElement(Row, retProps);
}
