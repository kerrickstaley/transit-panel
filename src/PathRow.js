import Row from './Row.js';
import React from 'react';
import defaultIcon from './images/below_grade_train.png';
import mrazza from './mrazza.js';
import util from './util.js';
import schedule from './schedule.js';
import pathTrain from './pathTrain.js';

export default function PathRow(props) {
    let {origin, destination, walkSec} = props;
    let scheduleBetween = pathTrain.getScheduleBetween(origin, destination);
    let pumpLeaveUpdates = util.pumpLeaveUpdatesWithFallback([
        mrazza.pumpLeaveUpdates(origin, destination, walkSec),
        schedule.pumpLeaveUpdates(scheduleBetween, walkSec),
    ]);
    let retProps = {
        pumpLeaveUpdates,
        title: props.title ?? `PATH to ${destination}`,
        icon: props.icon ?? defaultIcon,
        backgroundColor: props.backgroundColor ?? backgroundColorData[destination],
    };

    return React.createElement(Row, retProps);
}

let backgroundColorData = {
    // Original color from PATH website is rgb(240, 171, 67).
    // Lightened 50% using https://pinetools.com/lighten-color
    thirtyThirdStreet: '#f7d5a1',
    // Original color from PATH website is rgb(70, 156, 35).
    // Lightened 50% using https://pinetools.com/lighten-color
    worldTradeCenter: '#99e17c',
};
