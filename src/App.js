import {useState, useEffect, createElement} from 'react';
import FullscreenButton from './FullscreenButton.js';
import NyWaterwayRow from './NyWaterwayRow.js';
import NjTransitRailRow from './NjTransitRailRow.js';
import PathRow from './PathRow.js';
import YAML from 'yaml';
import Ajv from 'ajv/dist/jtd';
import { betterAjvErrors } from '@apideck/better-ajv-errors';
import configSchema from './configSchema.json';

const ajv = new Ajv({allErrors: true});

const rowComponents = (() => {
  // TODO would be good if we didn't hardcode the list of row types here, and instead dynamically
  // imported row types as needed.
  let ret = {
    NjTransitRailRow,
    NyWaterwayRow,
    PathRow,
  };
  for (let key of Object.keys(ret)) {
    let newKey = key.charAt(0).toLowerCase() + key.substring(1, key.length - 3);
    ret[newKey] = ret[key];
    delete ret[key];
  }
  return ret;
})();

configSchema['properties']['rows']['elements']['properties']['type'] = {
  enum: Object.keys(rowComponents),
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
      Error: config param not specified in URL! Please put ?config=&lt;your config YAML URL&gt; in the URL.
    </div>;
  }

  if (!ajv.validate(configSchema, config)) {
    const betterErrors = betterAjvErrors({configSchema, config, errors: ajv.errors});
    return <div>Invalid config: {JSON.stringify(betterErrors)}</div>;
  }

  let rows = [];
  for (let row of config.rows) {
    let rowComponent = rowComponents[row['type']];
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
