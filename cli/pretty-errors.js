var chalk = require('chalk');

module.exports = function prettyErrors(verbose) {
  return function (err) {
    if (verbose) {
      console.log(err.stack.replace(new RegExp('^' + err.name + ':'), chalk.red(err.name) + chalk.blue(': ')));
    } else {
      console.log(chalk.red(err.name) + chalk.blue(': ')  + err.message);
    }
    // Please don't call this
    // process.exit(-1);
  };
};
