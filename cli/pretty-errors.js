var chalk = require('chalk');

module.exports = function prettyErrors(verbose) {
  return function (err) {
    if (typeof(err) === 'object' && err.message) {
      if (verbose) {
        console.log(err.stack.replace(new RegExp('^' + err.name + ':'), chalk.red(err.name) + chalk.blue(': ')));
      } else {
        console.log(chalk.red(err.name) + chalk.blue(': ')  + err.message);
      }
      if (err.module) {
        console.log(chalk.blue('In module: ') + err.module.request);
      }
    } else if (typeof(err) === 'string') {
      if (!verbose) {
        err = err.replace(/\n(    at [^)\n]+\)\n)+/, '');
      }
      console.log(err);
    } else {
      console.log(err);
    }
    // Please don't call this
    // process.exit(-1);
  };
};
