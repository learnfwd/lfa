var semver = require('semver');
var childProcess = require('child_process');
var when = require('when');
var path = require('path');
var chalk = require('chalk');
var inquirer = require('inquirer');
var fs = require('fs');
var nodefn = require('when/node');

var noEngineField = [
  chalk.yellow('Warning: '),
  'Your package.json doesn\'t specify the compatible lfa version in the ',
  chalk.blue('engines'),
  ' field'
].join('');

var outdatedLFA = [
  chalk.red('Error: '),
  'This project requires a newer version of lfa. Please update lfa by running ',
  chalk.blue('npm update -g lfa')
].join('');

var notSatisfied = [
  chalk.yellow('Warning: '),
  'This project requires a different (possibly older) version of lfa. We encourage you to run ',
  chalk.yellow('lfa update-project'),
  ' to upgrade your project.'
].join('');

var installLFAInfo = 'However, for the time being, you can download and install the older version of lfa inside the project folder and continue working.';
var installLFAPrompt = 'Would you want to do that now?';

var cantContinue = [
  chalk.red('Error: '),
  'Can\'t continue without a compatible version of lfa. Will quit.'
].join('');

var foundLFA = [
  chalk.blue('Info: '),
  'Found locally-installed lfa. Switching to that'
].join('');

module.exports = function switchControl(cli, config) {
  if (cli.flags.switchCheck === false) {
    return config;
  }

  var myVersion = cli.pkg.version;
  var engines = config.package.engines || {};
  var requiredVersion = (typeof(engines) === 'object') ? engines.lfa : null;
  if (!requiredVersion || typeof(requiredVersion) !== 'string') {
    console.log(noEngineField);
    return config;
  }

  if (semver.satisfies(myVersion, requiredVersion)) {
    return config;
  }

  if (semver.ltr(myVersion, requiredVersion)) {
    console.log(outdatedLFA);
    process.exit(1);
  }

  console.log(notSatisfied);

  var projModulePath = path.dirname(config.packagePath);
  var lfaPath = path.join(projModulePath, 'node_modules', 'lfa', 'cli');
  return nodefn.call(fs.stat, lfaPath).then(function () {
    return true;
  }, function () {
    return false;
  }).then(function (exists) {
    // if lfa isn't locally installed, bail
    if (!exists) {
      console.log(cantContinue);
      process.exit(1);
    }
    console.log(foundLFA);
  }).then(function () {
    var args = process.argv.slice(2);
    args.push('--no-switch-check');

    var child = childProcess.fork(lfaPath, args, {
      cwd: process.cwd,
      env: process.env,
    });

    child.on('exit', function (code, signal) {
      if (signal) {
        process.exit(-1);
      }
      process.exit(code);
    });

    return when.promise(function () {}); //Endless promise to stall execution
  });
};

