var LFA = require('../../');
var chalk = require('chalk');
var switchControl = require('../switch');
var prettyErrors = require('../pretty-errors');
var configFlags = require('../config-flags');
var EventOutput = require('../event-output');

module.exports = function compile(cli) {
  var projPath = cli.flags.book;
  var verbose = cli.flags.v || cli.flags.verbose;
  var debug = !!cli.flags.debug;
  var werror = cli.flags['warnings-as-errors'] || cli.flags.werror || cli.flags['Werror'];
  var publicPath = cli.flags.publicPath;
  var bundleName = cli.flags.bundleName;

  return LFA.loadPaths({
    path: projPath,
    pluginProject: cli.flags.plugin,
  }).then(function (config) {
    return switchControl(cli, config);
  }).then(function (config) {
    return configFlags(config, cli.flags);
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
    new EventOutput(lfa, verbose);

    var task = cli.input.length >= 2 ? cli.input[1] : null;
    return lfa.compile({
      task: task,
      debug: debug,
      bundleName: bundleName,
      publicPath: publicPath,
      warningsAsErrors: werror,
    }).catch(function () {
    });

  }).catch(prettyErrors(verbose));
};
