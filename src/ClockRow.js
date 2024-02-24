import {useState, useEffect} from 'react';
import {DateTime} from 'luxon';
import './Row.css';
import './ClockRow.css';

function pumpTime(setTime) {
    const minuteMs = 60000;
    let loopTimeoutId = null;

    function loop() {
        let time = new Date();
        let dt = new DateTime(time);
        setTime(dt.toFormat('hh:mm'));
        // sleep until 0.1 seconds after the time changes
        loopTimeoutId = setTimeout(loop, 100 + minuteMs - (time % minuteMs));
    }

    function cancel() {
        clearTimeout(loopTimeoutId);
    }

    loop();
    return cancel;
}

export default function ClockRow(props) {
    const {backgroundColor} = props;

    const [time, setTime] = useState('?');

    useEffect(() => {
        return pumpTime(setTime);
    }, []);

    return <div className="row clock-row" style={{backgroundColor: backgroundColor ?? '#f7bcd6'}}>
        <div className="spacer-left"></div>
        <div className="clock-time">{time}</div>
        <div className="spacer-right"></div>
    </div>;
}
