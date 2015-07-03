var clean = require('./clean');

module.exports = function cleanPlugin(cli) {
  cli.flags.plugin = true;
  return clean(cli);
};
