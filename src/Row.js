import {useState, useEffect, createElement} from 'react';
import './Row.css';

const maxLeaveSecToShowOption = 90 * 60;

function RowInner(props) {
  const {title, icon, backgroundColor, pumpDepartures, walkMinutes} = props;

  const [leaveMin, setLeaveMin] = useState('?');
  const [visible, setVisible] = useState(true);
  const [method, setMethod] = useState('?');

  useEffect(() => {
    let displayDeparturesLoopTimeoutId = null;

    // displayDepartures starts a setTimeout-loop that updates the displayed leaveMin as time
    // elapses. This is necessary so that the value continues to update even if no new leave
    // updates are pumped.
    function displayDepartures(departures) {
      clearTimeout(displayDeparturesLoopTimeoutId);
      displayDeparturesLoopTimeoutId = null;

      departures.sort();

      function loop() {
        // When you would arrive at the station if you left now.
        let walkArrival = new Date(new Date() / 1 + walkMinutes * 60 * 1000);

        let nextDeparture = null;
        for (let departure of departures) {
          if (departure.departure >= walkArrival) {
            nextDeparture = departure;
            break;
          }
        }

        if (nextDeparture === null) {
          setLeaveMin('?');
          setMethod('?');
          setVisible(true);
          displayDeparturesLoopTimeoutId = null;
          return;
        }

        let leaveSec = (nextDeparture.departure - walkArrival) / 1000;
        let leaveMin = Math.floor(leaveSec / 60);
        setLeaveMin(leaveMin);
        setMethod(nextDeparture.methodAbbrev);
        setVisible(leaveSec <= maxLeaveSecToShowOption);

        displayDeparturesLoopTimeoutId = setTimeout(
          // Add 0.1 seconds so that the timer will definitely roll over by the time we get there.
          loop, (leaveSec % 60 + 0.1) * 1000);
      }

      loop();
    }

    let cancelPump = pumpDepartures(displayDepartures);
    return function cancel() {
      cancelPump();
      clearTimeout(displayDeparturesLoopTimeoutId);
    };
  }, [pumpDepartures, walkMinutes]);

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
