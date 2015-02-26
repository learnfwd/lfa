var LFA = require('../../');
var chalk = require('chalk');
var prettyErrors = require('../pretty-errors');

module.exports = function compile(cli) {
  var projPath = cli.flags.book;
  var verbose = cli.flags.v || cli.flags.verbose;

  process.stdout.write(chalk.green('cleaning up... '));
  LFA.cleanProject(projPath).then(function () {
    console.log('done');
  }).catch(function (err) {
    console.log(chalk.red('error'));
    throw err;
  }).catch(prettyErrors(verbose));
};
