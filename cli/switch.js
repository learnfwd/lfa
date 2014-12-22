var semver = require('semver');
var childProcess = require('child_process');
var when = require('when');
var path = require('path');
var chalk = require('chalk');

var noLFAError = [
  chalk.yellow('WARNING: '),
  'LFA is not a local dependency of the project. Please run ',
  chalk.yellow('lfa upgrade-project')
].join('');

var notSatisfied = [
  chalk.yellow('WARNING: '),
  'The globally-installed LFA doesn\'t satisfy the project\'s dependency field. We encourage you to run ',
  chalk.yellow('lfa upgrade-project'),
  '. Will now switch to the project\'s copy.'
].join('');

module.exports = function switchControl(cli, config) {
  if (cli.flags.switch === false) {
    return config;
  }

  var deps = config.package.dependencies;
  var required = (typeof(deps) === 'object') ? deps.lfa : undefined;
  var version = cli.pkg.version;

  if (!required) {
    console.log(noLFAError);
  } else if (!semver.satisfies(version, required)) {
    console.log(notSatisfied);
    var lfaPath = path.join(path.dirname(config.packagePath), 'node_modules', 'lfa', 'cli');

    var args = process.argv.slice(2);
    args.push('--no-switch');

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
  }

  return config;
};

