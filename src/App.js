import {useState, useEffect, createElement} from 'react';
import FullscreenButton from './FullscreenButton.js';
import NyWaterwayRow from './NyWaterwayRow.js';
import NjTransitRailRow from './NjTransitRailRow.js';
import PathRow from './PathRow.js';
import YAML from 'yaml';

// TODO would be good if we didn't need this
const rowComponents = {
  NjTransitRailRow,
  NyWaterwayRow,
  PathRow,
};

const CONFIG_NOT_IN_URL = 'CONFIG_NOT_IN_URL';
const CONFIG_LOADING = 'CONFIG_LOADING';

function loadConfig() {
  const urlParams = new URLSearchParams(window.location.search);
  let configUrl = urlParams.get('config');
  if (configUrl === null) {
    return Promise.resolve(CONFIG_NOT_IN_URL);
  }
  return fetch(configUrl).then(resp => resp.text()).then(text => YAML.parse(text));
}

function App() {
  let [config, setConfig] = useState(CONFIG_LOADING);

  useEffect(() => {
    loadConfig().then(yaml => setConfig(yaml));
  }, []);

  if (config === CONFIG_LOADING) {
    return <div>Loading config...</div>;
  } else if (config === CONFIG_NOT_IN_URL) {
    return <div>
      config param not specified in URL! Please put ?config=&lt;your config YAML URL&gt; in the URL.
    </div>;
  }

  let rows = [];
  for (let row of config.rows) {
    let rowComponentName = row.type.charAt(0).toUpperCase() + row.type.substring(1) + 'Row';
    let rowComponent = rowComponents[rowComponentName];
    let props = Object.assign({}, row);
    delete props['type'];
    // TODO fix
    props['walkSec'] = props['walkMinutes'] * 60;
    delete props['walkMinutes'];
    rows.push(createElement(rowComponent, props));
  }
  return createElement('div', {}, ...rows, <FullscreenButton />);
}

export default App;
