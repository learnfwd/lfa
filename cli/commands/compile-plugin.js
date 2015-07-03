var compile = require('./compile');

module.exports = function compilePlugin(cli) {
  cli.flags.plugin = true;
  return compile(cli);
};
