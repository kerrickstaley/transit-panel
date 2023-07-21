import { XMLParser } from 'fast-xml-parser';
import Row from './Row.js';
import React from 'react';
import util from './util.js';
import defaultIcon from './images/below_grade_train.png';

// TODO include information from the 'pt' field in the XML to try to get sub-minute resolution.
function getDeparturesFromXml(xml, routeNum, now) {
    let parsed = (new XMLParser()).parse(xml);
    let stop = parsed['stop'];
    
    if (stop['noPredictionMessage'] !== undefined) {
        return [];
    }

    let ret = [];
    // When there is only a single element, the XML parsing library returns an object
    // instead of an array of objects.
    let preArr = Array.isArray(stop['pre']) ? stop['pre'] : [stop['pre']];
    for (let pre of preArr) {
        if (pre['rn'] !== routeNum) {
            continue;
        }
        ret.push({
            departure: util.getNextInstanceOfTime(now, pre['nextbusonroutetime']),
            methodAbbrev: 'API',
        });
    }

    return ret;
}

function pumpDeparturesFunc(apiUrl, stopId, routeNum) {
    return setDepartures => {
        let loopTimeoutId = null;

        function loop() {
            fetch(apiUrl + '?stop=' + stopId).then(resp => resp.text())
            .then(xml => setDepartures(getDeparturesFromXml(xml, routeNum, new Date())));

            // TODO this can be more efficient
            loopTimeoutId = setTimeout(loop, (40 + 5 * Math.random()) * 1000);
        }

        function cancel() {
            clearTimeout(loopTimeoutId);
        }

        loop();
        return cancel;
    };
}

export default function NjTransitBusRow(props) {
    let {apiUrl, stop: stopId, route: routeNum, walkMinutes} = props;

    let pumpDepartures = pumpDeparturesFunc(apiUrl, stopId, routeNum);

    let retProps = {
        pumpDepartures,
        title: props.title ?? `Bus ${routeNum}`,
        icon: props.icon ?? defaultIcon,
        backgroundColor: props.backgroundColor ?? '#aaaaaa',
        walkMinutes,
    };

    return React.createElement(Row, retProps);
}

export {
    getDeparturesFromXml,
};
