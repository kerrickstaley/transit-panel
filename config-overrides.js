const json5 = require('json5');

// /**
//  * React App Rewired Config
//  */
// module.exports = {
//   // Update webpack config to use custom loader for .json5 files
//   webpack: (config) => {
//     // Add JSON5 file support
//     // See <https://github.com/webpack/webpack/tree/main/examples/custom-json-modules>
//     config.module.rules.push({
//       test: /\.json5$/,
//       type: 'json',
//       parser: {
//         parse: json5.parse,
//       },
//     });

//     return config;
//   },
// };

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
