import FullscreenButton from './FullscreenButton.js';
import NyWaterwayFerryRow from './NyWaterwayFerryRow.js';
import NjTransitRailRow from './NjTransitRailRow.js';
import PathRow from './PathRow.js';

function App() {
  return (
    <div>
      <PathRow origin="hoboken" destination="worldTradeCenter" rowTitle="PATH to WTC" walkSec={600} />
      <PathRow origin="hoboken" destination="thirtyThirdStreet" rowTitle="PATH to 33rd" walkSec={600} />
      <NyWaterwayFerryRow origin="hoboken" destination="brookfield" walkSec={600} />
      <NjTransitRailRow origin="hoboken" routeName="bntnm" walkSec={660} rowTitle="BNTNM to Newark" />
      <FullscreenButton />
    </div>
  );
}

export default App;
