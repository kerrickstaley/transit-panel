import Row from './Row.js';
import React from 'react';
import defaultIcon from './images/below_grade_train.png';
import mrazza from './mrazza.js';
import util from './util.js';
import schedule from './schedule.js';

export default function PathRow(props) {
    let {origin, route, walkSec} = props;
    let routeSchedule = scheduleData[origin][route];
    let pumpLeaveUpdates = util.pumpLeaveUpdatesWithFallback([
        mrazza.pumpLeaveUpdates(origin, route, walkSec),
        schedule.pumpLeaveUpdatesFromSchedule(routeSchedule, walkSec),
    ]);
    let retProps = {
        pumpLeaveUpdates,
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

// TODO figure out how to put this into a json5 file in a way that works in tests
let scheduleData = {
    hoboken: {
        world_trade_center: {
            weekday: [
                '6:14 AM',
                '6:24 AM',
                '6:34 AM',
                '6:44 AM',
                '6:54 AM',
                '7:04 AM',
                '7:12 AM',
                '7:20 AM',
                '7:28 AM',
                '7:34 AM',
                '7:43 AM',
                '7:50 AM',
                '7:58 AM',
                '8:04 AM',
                '8:10 AM',
                '8:17 AM',
                '8:23 AM',
                '8:29 AM',
                '8:35 AM',
                '8:41 AM',
                '8:47 AM',
                '8:54 AM',
                '9:00 AM',
                '9:06 AM',
                '9:12 AM',
                '9:18 AM',
                '9:24 AM',
                '9:31 AM',
                '9:38 AM',
                '9:48 AM',
                '9:58 AM',
                '10:08 AM',
                '10:18 AM',
                '10:33 AM',
                '10:48 AM',
                '11:03 AM',
                '11:18 AM',
                '11:33 AM',
                '11:48 AM',
                '12:03 PM',
                '12:18 PM',
                '12:33 PM',
                '12:48 PM',
                '1:03 PM',
                '1:18 PM',
                '1:33 PM',
                '1:48 PM',
                '2:03 PM',
                '2:18 PM',
                '2:33 PM',
                '2:45 PM',
                '2:57 PM',
                '3:09 PM',
                '3:21 PM',
                '3:33 PM',
                '3:45 PM',
                '3:57 PM',
                '4:09 PM',
                '4:18 PM',
                '4:24 PM',
                '4:30 PM',
                '4:40 PM',
                '4:48 PM',
                '4:54 PM',
                '5:00 PM',
                '5:06 PM',
                '5:12 PM',
                '5:19 PM',
                '5:25 PM',
                '5:31 PM',
                '5:37 PM',
                '5:43 PM',
                '5:50 PM',
                '5:56 PM',
                '6:02 PM',
                '6:08 PM',
                '6:14 PM',
                '6:22 PM',
                '6:34 PM',
                '6:46 PM',
                '6:58 PM',
                '7:09 PM',
                '7:21 PM',
                '7:33 PM',
                '7:45 PM',
                '7:57 PM',
                '8:09 PM',
                '8:21 PM',
                '8:33 PM',
                '8:45 PM',
                '8:57 PM',
                '9:09 PM',
                '9:21 PM',
                '9:33 PM',
                '9:45 PM',
                '9:57 PM',
                '10:11 PM',
                '10:26 PM',
                '10:41 PM',
                '10:56 PM',
                '11:11 PM',
            ],
            // does not run on weekend
            weekend: [],
        },
        thirty_third_street: {
            weekday: [
                // Blue line (non-late-night, goes directly from Hoboken)
                // https://www.panynj.gov/path/en/schedules-maps/hoboken-33-st--weekday-schedule.html
                '6:10 AM',
                '6:20 AM',
                '6:30 AM',
                '6:40 AM',
                '6:50 AM',
                '7:00 AM',
                '7:10 AM',
                '7:20 AM',
                '7:28 AM',
                '7:36 AM',
                '7:43 AM',
                '7:50 AM',
                '7:57 AM',
                '8:04 AM',
                '8:12 AM',
                '8:19 AM',
                '8:26 AM',
                '8:33 AM',
                '8:40 AM',
                '8:48 AM',
                '8:55 AM',
                '9:02 AM',
                '9:09 AM',
                '9:16 AM',
                '9:24 AM',
                '9:32 AM',
                '9:42 AM',
                '9:52 AM',
                '10:02 AM',
                '10:12 AM',
                '10:22 AM',
                '10:32 AM',
                '10:43 AM',
                '10:58 AM',
                '11:13 AM',
                '11:28 AM',
                '11:43 AM',
                '11:58 AM',
                '12:13 PM',
                '12:28 PM',
                '12:43 PM',
                '12:58 PM',
                '1:13 PM',
                '1:28 PM',
                '1:43 PM',
                '1:58 PM',
                '2:13 PM',
                '2:28 PM',
                '2:42 PM',
                '2:52 PM',
                '3:02 PM',
                '3:12 PM',
                '3:22 PM',
                '3:32 PM',
                '3:42 PM',
                '3:52 PM',
                '4:02 PM',
                '4:12 PM',
                '4:22 PM',
                '4:32 PM',
                '4:42 PM',
                '4:50 PM',
                '4:58 PM',
                '5:06 PM',
                '5:13 PM',
                '5:20 PM',
                '5:27 PM',
                '5:34 PM',
                '5:42 PM',
                '5:49 PM',
                '5:56 PM',
                '6:03 PM',
                '6:10 PM',
                '6:18 PM',
                '6:25 PM',
                '6:32 PM',
                '6:39 PM',
                '6:46 PM',
                '6:54 PM',
                '7:02 PM',
                '7:12 PM',
                '7:22 PM',
                '7:32 PM',
                '7:42 PM',
                '7:52 PM',
                '8:02 PM',
                '8:12 PM',
                '8:22 PM',
                '8:32 PM',
                '8:42 PM',
                '8:52 PM',
                '9:02 PM',
                '9:12 PM',
                '9:25 PM',
                '9:40 PM',
                '9:55 PM',
                '10:10 PM',
                '10:25 PM',
                '10:40 PM',
                // Yellow-blue line (goes from Journal Square via Hoboken)
                // https://www.panynj.gov/path/en/schedules-maps/journal-square-33-st---via-hoboken--weeknight-schedule.html
                '12:23 AM',
                '12:58 AM',
                '1:38 AM',
                '2:18 AM',
                '2:58 AM',
                '3:38 AM',
                '4:18 AM',
                '4:58 AM',
                '5:38 AM',
                '5:52 AM',
                '11:13 PM',
                '11:48 PM',
            ],
            // https://www.panynj.gov/path/en/schedules-maps/journal-square-33--via-hoboken--saturday-schedule.html
            saturday: [
                '12:23 AM',
                '12:58 AM',
                '1:38 AM',
                '2:18 AM',
                '2:58 AM',
                '3:38 AM',
                '4:18 AM',
                '4:58 AM',
                '5:38 AM',
                '6:13 AM',
                '6:48 AM',
                '7:23 AM',
                '7:59 AM',
                '8:14 AM',
                '8:29 AM',
                '8:44 AM',
                '8:59 AM',
                '9:14 AM',
                '9:29 AM',
                '9:44 AM',
                '9:58 AM',
                '10:13 AM',
                '10:25 AM',
                '10:37 AM',
                '10:49 AM',
                '11:01 AM',
                '11:13 AM',
                '11:25 AM',
                '11:37 AM',
                '11:49 AM',
                '12:01 PM',
                '12:13 PM',
                '12:25 PM',
                '12:37 PM',
                '12:49 PM',
                '1:01 PM',
                '1:13 PM',
                '1:25 PM',
                '1:37 PM',
                '1:49 PM',
                '2:01 PM',
                '2:13 PM',
                '2:25 PM',
                '2:37 PM',
                '2:49 PM',
                '3:01 PM',
                '3:13 PM',
                '3:25 PM',
                '3:37 PM',
                '3:49 PM',
                '4:01 PM',
                '4:13 PM',
                '4:25 PM',
                '4:37 PM',
                '4:49 PM',
                '5:01 PM',
                '5:13 PM',
                '5:25 PM',
                '5:37 PM',
                '5:49 PM',
                '6:01 PM',
                '6:13 PM',
                '6:25 PM',
                '6:37 PM',
                '6:49 PM',
                '7:01 PM',
                '7:13 PM',
                '7:25 PM',
                '7:37 PM',
                '7:49 PM',
                '8:01 PM',
                '8:13 PM',
                '8:25 PM',
                '8:37 PM',
                '8:49 PM',
                '9:01 PM',
                '9:13 PM',
                '9:25 PM',
                '9:37 PM',
                '9:49 PM',
                '10:01 PM',
                '10:13 PM',
                '10:28 PM',
                '10:43 PM',
                '10:58 PM',
                '11:13 PM',
                '11:28 PM',
                '11:48 PM',
                '12:03 AM',
            ],
            // https://www.panynj.gov/path/en/schedules-maps/journal-square-33-st---via-hoboken--sunday-schedule.html
            sunday: [
                '12:23 AM',
                '12:38 AM',
                '12:58 AM',
                '1:18 AM',
                '1:38 AM',
                '1:58 AM',
                '2:18 AM',
                '2:58 AM',
                '3:38 AM',
                '4:18 AM',
                '4:58 AM',
                '5:38 AM',
                '6:13 AM',
                '6:48 AM',
                '7:23 AM',
                '7:58 AM',
                '8:33 AM',
                '9:08 AM',
                '9:43 AM',
                '9:58 AM',
                '10:13 AM',
                '10:25 AM',
                '10:37 AM',
                '10:49 AM',
                '11:01 AM',
                '11:13 AM',
                '11:25 AM',
                '11:37 AM',
                '11:49 AM',
                '12:01 PM',
                '12:13 PM',
                '12:25 PM',
                '12:37 PM',
                '12:49 PM',
                '1:01 PM',
                '1:13 PM',
                '1:25 PM',
                '1:37 PM',
                '1:49 PM',
                '2:01 PM',
                '2:13 PM',
                '2:25 PM',
                '2:37 PM',
                '2:49 PM',
                '3:01 PM',
                '3:13 PM',
                '3:25 PM',
                '3:37 PM',
                '3:49 PM',
                '4:01 PM',
                '4:13 PM',
                '4:25 PM',
                '4:37 PM',
                '4:49 PM',
                '5:01 PM',
                '5:13 PM',
                '5:25 PM',
                '5:37 PM',
                '5:49 PM',
                '6:01 PM',
                '6:13 PM',
                '6:25 PM',
                '6:37 PM',
                '6:49 PM',
                '7:01 PM',
                '7:13 PM',
                '7:25 PM',
                '7:37 PM',
                '7:49 PM',
                '8:01 PM',
                '8:13 PM',
                '8:28 PM',
                '8:48 PM',
                '9:08 PM',
                '9:28 PM',
                '9:48 PM',
                '10:08 PM',
                '10:28 PM',
                '10:48 PM',
                '11:13 PM',
                '11:48 PM',
            ],
        },
    },
    world_trade_center: {
        hoboken: {
            weekday: [
                '5:58 AM',
                '6:08 AM',
                '6:18 AM',
                '6:28 AM',
                '6:38 AM',
                '6:48 AM',
                '6:58 AM',
                '7:12 AM',
                '7:19 AM',
                '7:28 AM',
                '7:34 AM',
                '7:42 AM',
                '7:48 AM',
                '8:00 AM',
                '8:06 AM',
                '8:13 AM',
                '8:19 AM',
                '8:25 AM',
                '8:31 AM',
                '8:38 AM',
                '8:44 AM',
                '8:50 AM',
                '8:56 AM',
                '9:02 AM',
                '9:09 AM',
                '9:15 AM',
                '9:22 AM',
                '9:32 AM',
                '9:42 AM',
                '9:52 AM',
                '10:02 AM',
                '10:12 AM',
                '10:27 AM',
                '10:42 AM',
                '10:57 AM',
                '11:12 AM',
                '11:27 AM',
                '11:42 AM',
                '11:57 AM',
                '12:12 PM',
                '12:27 PM',
                '12:42 PM',
                '12:57 PM',
                '1:12 PM',
                '1:27 PM',
                '1:42 PM',
                '1:57 PM',
                '2:12 PM',
                '2:27 PM',
                '2:39 PM',
                '2:51 PM',
                '3:03 PM',
                '3:15 PM',
                '3:27 PM',
                '3:39 PM',
                '3:51 PM',
                '4:03 PM',
                '4:09 PM',
                '4:15 PM',
                '4:25 PM',
                '4:32 PM',
                '4:38 PM',
                '4:44 PM',
                '4:50 PM',
                '4:56 PM',
                '5:03 PM',
                '5:09 PM',
                '5:15 PM',
                '5:21 PM',
                '5:27 PM',
                '5:34 PM',
                '5:40 PM',
                '5:46 PM',
                '5:52 PM',
                '5:58 PM',
                '6:05 PM',
                '6:12 PM',
                '6:18 PM',
                '6:24 PM',
                '6:31 PM',
                '6:39 PM',
                '6:51 PM',
                '7:03 PM',
                '7:15 PM',
                '7:27 PM',
                '7:39 PM',
                '7:51 PM',
                '8:03 PM',
                '8:15 PM',
                '8:27 PM',
                '8:39 PM',
                '8:51 PM',
                '9:03 PM',
                '9:15 PM',
                '9:27 PM',
                '9:41 PM',
                '9:56 PM',
                '10:11 PM',
                '10:26 PM',
                '10:41 PM',
                '10:56 PM',
            ],
            // does not run on weekend
            weekend: [],
        },
    },
};