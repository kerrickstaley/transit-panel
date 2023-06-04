import Row from './Row.js';
import React from 'react';
import defaultIcon from './images/below_grade_train.png';
import mrazza from './mrazza.js';

export default function PathRow(props) {
    let {origin, route, walkSec} = props;
    let retProps = {
        pumpLeaveUpdates: mrazza.pumpLeaveUpdates(origin, route, walkSec),
        rowTitle: props.rowTitle ?? `PATH to ${route}`,
        icon: props.icon ?? defaultIcon,
        backgroundColor: props.backgroundColor ?? backgroundColorData[route],
    };

    return React.createElement(Row, retProps);
}

let backgroundColorData = {
    // Original color from PATH website is rgb(240, 171, 67).
    // Lightened 50% using https://pinetools.com/lighten-color
    thirty_third_street: '#f7d5a1', 
    // Original color from PATH website is rgb(70, 156, 35).
    // Lightened 50% using https://pinetools.com/lighten-color
    world_trade_center: '#99e17c',
};
