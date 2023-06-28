import Row from './Row.js';
import React from 'react';
import defaultIcon from './images/below_grade_train.png';
import mrazza from './mrazza.js';
import util from './util.js';
import schedule from './schedule.js';
import pathTrain from './pathTrain.js';

export default function PathRow(props) {
    let {origin, destination, walkMinutes} = props;

    let scheduleBetween = null;
    try {
        scheduleBetween = pathTrain.getScheduleBetween(origin, destination);
    } catch (exc) {
        return <Row configError={exc.message} />
    }

    if (Object.keys(scheduleBetween).length === 0) {
        return <Row configError={`There are no PATH routes from ${origin} to ${destination}.`} />
    }

    let pumpDepartures = util.pumpDeparturesWithFallback([
        mrazza.pumpDepartures(origin, destination),
        schedule.pumpDepartures(scheduleBetween),
    ]);
    let retProps = {
        pumpDepartures,
        title: props.title ?? `PATH to ${destination}`,
        icon: props.icon ?? defaultIcon,
        backgroundColor: props.backgroundColor
            ?? getDefaultBackgroundColor(pathTrain.getRoutesBetween(origin, destination)),
        walkMinutes,
    };

    return React.createElement(Row, retProps);
}

function getDefaultBackgroundColor(routesBetween) {
    let colors = [
        // Orange
        // Original color from PATH website is rgb(240, 171, 67).
        // Lightened 50% using https://pinetools.com/lighten-color
        ['journalSquareToThirtyThirdStreet', '#f7d5a1'],
        // Green
        // Original color from PATH website is rgb(70, 156, 35).
        // Lightened 50% using https://pinetools.com/lighten-color
        ['hobokenToWorldTradeCenter', '#99e17c'],
        // Red
        // Original color from PATH website is rgb(213, 61, 46).
        // Lightened 50% using https://pinetools.com/lighten-color
        ['newarkToWorldTradeCenter', '#ea9e96'],
        // Blue
        // Original color from PATH website is rgb(43, 133, 187).
        // Lightened 40% using https://pinetools.com/lighten-color
        ['hobokenToThirtyThirdStreet', '#76b8df'],
    ];

    for (let [routeName, color] of colors) {
        if (routesBetween.indexOf(routeName) !== -1
            || routesBetween.indexOf(pathTrain.getReverseRoute(routeName)) !== -1) {
            return color;
        }
    }

    // Should not happen?
    return '#cccccc';
}
