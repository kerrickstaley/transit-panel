const json5 = require('json5');

module.exports = function override(config, env) {
    config.module.rules.push({
      test: /\.json5$/,
      type: 'json',
      parser: {
        parse: json5.parse,
      },
    });

    return config;
}
