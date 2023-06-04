import {useState, useEffect} from 'react';
import './Row.css';

const maxLeaveSecToShowOption = 90 * 60;

export default function Row(props) {
  const {rowTitle, icon, backgroundColor, pumpLeaveUpdates} = props;

  const [leaveMin, setLeaveMin] = useState('?');
  const [visible, setVisible] = useState(true);
  const [method, setMethod] = useState('?');

  function handleLeaveUpdates(leaveUpdates) {
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
      return;
    }

    let leaveSec = (nextLeaveUpdate.leaveTime - now) / 1000;
    let leaveMin = Math.floor(leaveSec / 60);
    setLeaveMin(leaveMin);
    setMethod(nextLeaveUpdate.methodAbbrev);
    setVisible(leaveSec <= maxLeaveSecToShowOption); 
    // TODO handle updating leaveMin even if handleLeaveUpdates doesn't get called
  }

  useEffect(() => pumpLeaveUpdates(handleLeaveUpdates), []);

  return <div className="row" style={{backgroundColor: backgroundColor, display: visible ? '' : 'none'}}>
      <div className="row-title-and-icon">
          <div className="row-title">{rowTitle}</div>
          <img src={icon} />
      </div>
      <div className="leave-in-min">{leaveMin}</div>
      <div className="spacer"></div>
      <div className="method">{method}</div>
  </div>;
}
