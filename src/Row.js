import {useState, useEffect, createElement} from 'react';
import './Row.css';

const maxLeaveSecToShowOption = 90 * 60;

function RowInner(props) {
  const {title, icon, backgroundColor, pumpLeaveUpdates} = props;

  const [leaveMin, setLeaveMin] = useState('?');
  const [visible, setVisible] = useState(true);
  const [method, setMethod] = useState('?');

  useEffect(() => {
    let displayLeaveUpdatesLoopTimeoutId = null;

    // displayLeaveUpdates starts a setTimeout-loop that updates the displayed leaveMin as time
    // elapses. This is necessary so that the value continues to update even if no new leave
    // updates are pumped.
    function displayLeaveUpdates(leaveUpdates) {
      clearTimeout(displayLeaveUpdatesLoopTimeoutId);
      displayLeaveUpdatesLoopTimeoutId = null;

      function loop() {
        let now = new Date();

        let nextLeaveUpdate = null;
        for (let leaveUpdate of leaveUpdates) {
          if (leaveUpdate.leaveTime >= now) {
            nextLeaveUpdate = leaveUpdate;
            break;
          }
        }

        if (nextLeaveUpdate === null) {
          setLeaveMin('?');
          setMethod('?');
          setVisible(true);
          displayLeaveUpdatesLoopTimeoutId = null;
          return;
        }

        let leaveSec = (nextLeaveUpdate.leaveTime - now) / 1000;
        let leaveMin = Math.floor(leaveSec / 60);
        setLeaveMin(leaveMin);
        setMethod(nextLeaveUpdate.methodAbbrev);
        setVisible(leaveSec <= maxLeaveSecToShowOption);

        displayLeaveUpdatesLoopTimeoutId = setTimeout(
          // Add 0.1 seconds so that the timer will definitely roll over by the time we get there.
          loop, (leaveSec % 60 + 0.1) * 1000);
      }

      loop();
    }

    let cancelPump = pumpLeaveUpdates(displayLeaveUpdates);
    return function cancel() {
      cancelPump();
      clearTimeout(displayLeaveUpdatesLoopTimeoutId);
    };
  }, [pumpLeaveUpdates]);

  return <div className="row" style={{backgroundColor: backgroundColor, display: visible ? '' : 'none'}}>
      <div className="row-title-and-icon">
          <div className="row-title">{title}</div>
          <img src={icon} alt="" />
      </div>
      <div className="leave-in-min">{leaveMin}</div>
      <div className="spacer"></div>
      <div className="method">{method}</div>
  </div>;
}

export default function Row(props) {
  const {configError} = props;

  if (configError !== null && configError !== undefined) {
    return <div className="row">Row config error: {configError}</div>;
  }

  return createElement(RowInner, props);
}
