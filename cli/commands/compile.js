var LFA = require('../../');
var chalk = require('chalk');
var switchControl = require('../switch');
var prettyErrors = require('../pretty-errors');

module.exports = function compile(cli) {
  var projPath = cli.flags.book;
  var verbose = cli.flags.v || cli.flags.verbose;
  var debug = !!cli.flags.debug;
  var werror = cli.flags['warnings-as-errors'] || cli.flags.werror || cli.flags['Werror'];

  return LFA.loadPaths(projPath).then(function (config) {
    return switchControl(cli, config);
  }).then(function (config) {
    process.stdout.write(chalk.green('loading project... '));

    return LFA.loadProject(config).then(function (lfa) {
      console.log('done');
      return lfa;
    }).catch(function (err) {
      console.log(chalk.red('error'));
      throw err;
    });

  }).then(function (lfa) {
    process.stdout.write(chalk.green('compiling... '));

    var task = cli.input.length >= 2 ? cli.input[1] : null;
    return lfa.compile({
      task: task,
      debug: debug,
      warningsAsErrors: werror,
    }).then(function () {
      console.log('done');
    }).catch(function (err) {
      console.log(chalk.red('error'));
      throw err;
    });

  }).catch(prettyErrors(verbose));
};
