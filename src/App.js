import {useState, useEffect, createElement} from 'react';
import FullscreenButton from './FullscreenButton.js';
import NyWaterwayRow from './NyWaterwayRow.js';
import NjTransitRailRow from './NjTransitRailRow.js';
import CitiBikeRow from './CitiBikeRow.js';
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
    CitiBikeRow,
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

function loadConfig(setConfig, setConfigError) {
  const urlParams = new URLSearchParams(window.location.search);
  let configUrl = urlParams.get('config');
  if (configUrl === null) {
    setConfigError(
      'Config param not specified in URL! Please put ?config=<your config YAML URL> in the URL.'
    );
    return;
  }

  fetch(configUrl).then(resp => {
    return resp.text();
  })
  .then(text => {
    let config = YAML.parse(text);

    if (!ajv.validate(configSchema, config)) {
      const betterErrors = betterAjvErrors({configSchema, config, errors: ajv.errors});
      setConfigError('Invalid config: ' + JSON.stringify(betterErrors));
      return;
    }

    setConfig(config);
  }).catch(err => setConfigError('' + err));
}

function App() {
  let [config, setConfig] = useState(null);
  let [configError, setConfigError] = useState(null);

  useEffect(() => {
    loadConfig(setConfig, setConfigError);
  }, []);

  if (configError !== null) {
    return <div>Config error: {configError}</div>;
  }

  if (config === null) {
    return <div>Loading config...</div>;
  }

  let rows = [];
  for (let row of config.rows) {
    let rowComponent = rowComponents[row['type']];
    let props = Object.assign({}, row);
    delete props['type'];
    rows.push(createElement(rowComponent, props));
  }
  return createElement('div', {}, ...rows, <FullscreenButton />);
}

export default App;
