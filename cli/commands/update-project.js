var LFA = require('../../');
var chalk = require('chalk');
var prettyErrors = require('../pretty-errors');
var semver = require('semver');
var _ = require('lodash');
var fs = require('fs');
var nodefn = require('when/node');

var upgradeSteps = [{
  from: '0.7.0',
  to: '^0.8.0',
  manualChanges: [
    'Importing paths from plugins (ex: ' + chalk.yellow('require("lfa-core/app")') + ') is not allowed anymore. Use only explicitly exported functionality from now on.',
    'Change ' + chalk.yellow('var App = require("lfa-core/app")') + ' to ' + chalk.yellow('var App = require("lfa-core").App') + '.',
    'Use ' + chalk.yellow('require("lfa-core").Storage') + ' instead of ' + chalk.yellow('App.storage') + '.',
    'Use ' + chalk.yellow('require("lfa-core").Translate') + ' instead of ' + chalk.yellow('App.T') + '.',
    chalk.yellow('config.styl') + ', or any other form of overriding ' + chalk.yellow('lfa-core') + ' Stylus variables is not supported anymore.',
  ]
}];

module.exports = function compile(cli) {
  var projPath = cli.flags.book || process.cwd();
  var verbose = cli.flags.v || cli.flags.verbose;

  return LFA.loadPaths(projPath).then(function (config) {
    var versionRange = config.package.engines.lfa;
    _.each(upgradeSteps, function (step) {

      if (!semver.satisfies(step.from, versionRange)) { return; }
      console.log(chalk.green('Converting from ') + chalk.yellow(versionRange) + chalk.green(' to ') + chalk.yellow(step.to));

      versionRange = step.to;

      if (typeof(step.transform) === 'function') {
        step.transform();
      }

      if (step.manualChanges.length) {
        console.log(chalk.yellow('Warning: ') + 'Fully automatic conversion is not possible. If it\'s the case, please, manually fix the following concerns:');
      }
      _.each(step.manualChanges, function (change, idx) {
        console.log(chalk.red(idx+1) + '. ' + change);
      });
    });

    config.package.engines.lfa = versionRange;
    var fileData = JSON.stringify(config.package, null, 2);

    return nodefn.call(fs.writeFile, config.packagePath, fileData);
  }).catch(prettyErrors(verbose));
};
