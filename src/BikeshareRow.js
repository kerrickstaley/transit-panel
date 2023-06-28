import {useState, useEffect} from 'react';
import icon from './images/bicycle.png';
import './Row.css';
import './BikeshareRow.css';

const minNumBikesToShowOption = 2;
const pollEverySec = 60;

function pumpBikesAvailable(displayBikesAvailable, stationStatusUrl, stationId) {
    let loopTimeoutId = null;

    function loop() {
        fetch(stationStatusUrl).then(resp => resp.json()).then(json => {
            let foundStation = null;
            for (let station of json['data']['stations']) {
                if (station.station_id === stationId) {
                    foundStation = station;
                    break;
                }
            }

            if (foundStation === null) {
                console.log(`Did not find station with id ${stationId}`);
                return;
            }

            let availableBikes = {
                allBikes: foundStation['num_bikes_available'],
                eBikes: foundStation['num_ebikes_available'],
            };

            displayBikesAvailable(availableBikes);
        }).finally(() => {
            loopTimeoutId = setTimeout(loop, (pollEverySec + 10 * (Math.random() - 0.5)) * 1000);
        });
    }

    function cancel() {
        clearTimeout(loopTimeoutId);
    }

    loop();
    return cancel;
}

export default function BikeshareRow(props) {
  const {title, backgroundColor, stationId, stationStatusUrl} = props;

  const [numBikesAvailable, setNumBikesAvailable] = useState('?');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    function displayBikesAvailable(bikesAvailable) {
        setNumBikesAvailable(bikesAvailable['allBikes']);
        setVisible(bikesAvailable['allBikes'] >= minNumBikesToShowOption);
    }

    return pumpBikesAvailable(
        displayBikesAvailable,
        stationStatusUrl,
        stationId);
  }, [stationStatusUrl, stationId]);

  return <div className="row bikeshare-row" style={{backgroundColor: backgroundColor, display: visible ? '' : 'none'}}>
      <div className="row-title-and-icon">
          <div className="row-title">{title}</div>
          <img src={icon} alt="" />
      </div>
      <div className="bikes-available">{numBikesAvailable}</div>
      <div className="spacer"></div>
  </div>;
}
