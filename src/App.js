import {useState, useEffect, createElement} from 'react';
import FullscreenButton from './FullscreenButton.js';
import NyWaterwayRow from './NyWaterwayRow.js';
import NjTransitRailRow from './NjTransitRailRow.js';
import ClockRow from './ClockRow.js';
import CitiBikeRow from './CitiBikeRow.js';
import MtaRow from './MtaRow.js';
import PathRow from './PathRow.js';
import NjTransitBusRow from './NjTransitBusRow.js';
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
    ClockRow,
    MtaRow,
    NjTransitRailRow,
    NyWaterwayRow,
    PathRow,
    NjTransitBusRow,
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

function loadConfig(name, schema, setConfig, setConfigError) {
  const urlParams = new URLSearchParams(window.location.search);
  let configUrl = urlParams.get(name);
  if (configUrl === null) {
    setConfigError(
      `${name} param not specified in URL! Please put ?${name}=<your ${name} YAML URL> in the URL.`
    );
    return;
  }

  fetch(configUrl, {cache: 'no-store'}).then(resp => {
    return resp.text();
  })
  .then(text => {
    let config = YAML.parse(text);

    if (!ajv.validate(schema, config)) {
      const betterErrors = betterAjvErrors({configSchema, config, errors: ajv.errors});
      setConfigError(`Invalid ${name}: ` + JSON.stringify(betterErrors));
      return;
    }

    setConfig(config);
  }).catch(err => setConfigError('' + err));
}

function App() {
  let [config, setConfig] = useState(null);
  let [configError, setConfigError] = useState(null);
  let [secrets, setSecrets] = useState(null);
  // eslint-disable-next-line no-unused-vars
  let [secretsError, setSecretsError] = useState(null);

  useEffect(() => {
    loadConfig('config', configSchema, setConfig, setConfigError);
  }, []);

  useEffect(() => {
    loadConfig('secrets', configSchema.optionalProperties.secrets, setSecrets, setSecretsError);
  }, []);

  if (secrets !== null) {
    console.log(secrets);
  }

  if (configError !== null) {
    return <div>Error: {configError}</div>;
  }

  if (config === null) {
    return <div>Loading config...</div>;
  }

  if (secrets === null && config.secrets !== undefined) {
    setSecrets(config.secrets);
  }

  let rows = [];
  for (let row of config.rows) {
    let rowComponent = rowComponents[row['type']];
    let props = Object.assign({}, row);
    delete props['type'];
    props['secrets'] = secrets;
    rows.push(createElement(rowComponent, props));
  }
  return createElement('div', {}, ...rows, <FullscreenButton />);
}

export default App;
