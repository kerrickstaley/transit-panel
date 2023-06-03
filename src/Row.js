import {useState, useEffect} from 'react';
import ids from './ids.js';
import './Row.css';

const maxLeaveSecToShowOption = 90 * 60;

export default function Row(props) {
  const {rowTitle, icon, backgroundColor, getLeaveSec} = props;

  const [leaveMin, setLeaveMin] = useState('?');
  const [visible, setVisible] = useState(true);
  const [method, setMethod] = useState('?');

  let displayLeaveMinLoopTimeoutId = null;
  function displayLeaveMinLoop() {
    const secPerMin = 60;  // Can set this to 1 to see the value update every second for testing.
    getLeaveSec().then(({leaveSec, method}) => {
        setLeaveMin(Math.floor(leaveSec / secPerMin));
        setVisible(leaveSec < maxLeaveSecToShowOption);
        setMethod(method);

        let sleepSec = ((leaveSec % secPerMin) + secPerMin) % secPerMin;
        if (method == ids.SCHEDULE) {
            // + .1 is a little hack to make sure that the minute has definitely rolled over by the time we get there.
            sleepSec += .1;
        } else if (ids.isApi(method)) {
            sleepSec = Math.min(30, sleepSec + 5);
        } else {
            console.log('unreachable');
            return;
        }
        sleepSec = Math.max(10, sleepSec);  // Avoid hitting the API too much
        displayLeaveMinLoopTimeoutId = setTimeout(
          displayLeaveMinLoop, sleepSec * 1000);
    });
  }

  useEffect(() => {
    displayLeaveMinLoop();

    return function cleanup() {
      clearTimeout(displayLeaveMinLoopTimeoutId);
    };
  }, []);

  return <div className="row" style={{backgroundColor: backgroundColor, display: visible ? '' : 'none'}}>
      <div className="row-title-and-icon">
          <div className="row-title">{rowTitle}</div>
          <img src={icon} />
      </div>
      <div className="leave-in-min">{leaveMin}</div>
      <div className="spacer"></div>
      <div className="method">{ids.methodAbbrev(method)}</div>
  </div>;
}
