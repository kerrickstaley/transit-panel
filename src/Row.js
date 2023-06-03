import {useState, useEffect} from 'react';
import ids from './ids.js';
import './Row.css';

const maxLeaveSecToShowOption = 90 * 60;

export default function Row(props) {
  const {row_title, icon, background_color, get_leave_sec} = props;

  const [leave_min, set_leave_min] = useState('?');
  const [visible, set_visible] = useState(true);
  const [method, setMethod] = useState('?');

  let display_leave_min_loop_timeout_id = null;
  function display_leave_min_loop() {
    const sec_per_min = 60;  // Can set this to 1 to see the value update every second for testing.
    get_leave_sec().then(({leaveSec, method}) => {
        set_leave_min(Math.floor(leaveSec / sec_per_min));
        set_visible(leaveSec < maxLeaveSecToShowOption);
        setMethod(method);

        let sleep_sec = ((leaveSec % sec_per_min) + sec_per_min) % sec_per_min;
        if (method == ids.SCHEDULE) {
            // + .1 is a little hack to make sure that the minute has definitely rolled over by the time we get there.
            sleep_sec += .1;
        } else if (ids.isApi(method)) {
            sleep_sec = Math.min(30, sleep_sec + 5);
        } else {
            console.log('unreachable');
            return;
        }
        sleep_sec = Math.max(10, sleep_sec);  // Avoid hitting the API too much
        display_leave_min_loop_timeout_id = setTimeout(
          display_leave_min_loop, sleep_sec * 1000);
    });
  }

  useEffect(() => {
    display_leave_min_loop();

    return function cleanup() {
      clearTimeout(display_leave_min_loop_timeout_id);
    };
  }, []);

  return <div className="row" style={{backgroundColor: background_color, display: visible ? '' : 'none'}}>
      <div className="row-title-and-icon">
          <div className="row-title">{row_title}</div>
          <img src={icon} />
      </div>
      <div className="leave-in-min">{leave_min}</div>
      <div className="spacer"></div>
      <div className="method">{ids.methodAbbrev(method)}</div>
  </div>;
}
