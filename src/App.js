import Row from './Row.js';
import FullscreenButton from './FullscreenButton.js';
import ids from './ids.js';
import schedule from './schedule.js';
import train from './images/train.png';
import ferry from './images/ferry.png';
import mrazza from './mrazza.js';

const walkTimeFromAptDoorToPathSec = 10 * 60;
const walkTimeFromAptDoorToFerrySec = 9.5 * 60;
const walkTimeToHobokenRailSec = 11 * 60;

function getLeaveSecGeneric(station, route, walkSec, getDeparturesFuncs) {
    let promises = getDeparturesFuncs.map(f => f(station, route));
    return Promise.allSettled(promises).then(allDepartures => {
        let leaveSecs = allDepartures.flatMap(result => {
            if (result.status != 'fulfilled') {
                console.log('Promise broken: ' + JSON.stringify(result));
                return [];
            }
            let leaveSecs = result.value.departures.flatMap(d => {
                let leaveSec = d - walkSec;
                return leaveSec >= 0 ? [leaveSec] : [];
            });
            return leaveSecs.length >= 1 ? [{leaveSec: leaveSecs[0], method: result.value.method}] : [];
        });
        return leaveSecs.length >= 1 ? leaveSecs[0] : null;
    });
}

function getLeaveSecPath(station, route, walkSec) {
    return getLeaveSecGeneric(station, route, walkSec, [mrazza.getDepartures, schedule.getDepartures]);
}

function getLeaveSecFerry(station, route, walkSec) {
    return getLeaveSecGeneric(station, route, walkSec, [schedule.getDepartures]);
}

function getLeaveSec(station, route, walkSec) {
    let method = {
        [ids.HOBOKEN]: getLeaveSecPath,
        [ids.WTC]: getLeaveSecPath,
        [ids.HOBOKEN_FERRY]: getLeaveSecFerry,
    }[station];
    return method(station, route, walkSec);
}

function getWtcPathLeaveSec() {
    return getLeaveSec(ids.HOBOKEN, ids.WTC, walkTimeFromAptDoorToPathSec);
}

function getPathTo33rdLeaveSec() {
    return getLeaveSec(ids.HOBOKEN, ids._33RD_ST, walkTimeFromAptDoorToPathSec);
}

function getBrookfieldFerryLeaveSec() {
    return getLeaveSec(ids.HOBOKEN_FERRY, ids.HOBOKEN_TO_BROOKFIELD_FERRY, walkTimeFromAptDoorToFerrySec);
}

function getBntnmLeaveSec() {
    return getLeaveSecGeneric(ids.HOBOKEN_NJ_TRANSIT_RAIL, ids.NJ_TRANSIT_BNTNM, walkTimeToHobokenRailSec, [schedule.getDepartures]);
}

function App() {
  return (
    <div>
      {/* Original color from PATH website is rgb(70, 156, 35).
        * Lightened 50% using https://pinetools.com/lighten-color */}
      <Row rowTitle="PATH to WTC" getLeaveSec={getWtcPathLeaveSec} icon={train} backgroundColor="#99e17c" />
      {/* Original color from PATH website is rgb(240, 171, 67).
        * Lightened 50% using https://pinetools.com/lighten-color */}
      <Row rowTitle="PATH to 33rd" getLeaveSec={getPathTo33rdLeaveSec} icon={train} backgroundColor="#f7d5a1" />
      <Row rowTitle="Ferry to Brookfield" getLeaveSec={getBrookfieldFerryLeaveSec} icon={ferry} backgroundColor="#d0e0e3" />
      {/* Original color is #e66859. Lightened 30% using https://pinetools.com/lighten-color */}
      <Row rowTitle="BNTNM to Newark" getLeaveSec={getBntnmLeaveSec} icon={train} backgroundColor="#ed958a" />
      <FullscreenButton />
    </div>
  );
}

export default App;
