var LFA = require('../../');
var chalk = require('chalk');
var semver = require('semver');
var childProcess = require('child_process');
var when = require('when');
var path = require('path');

var noLFAError = chalk.yellow('WARNING: ') + 'LFA is not a local dependency of the project. Please run ' + chalk.yellow('lfa upgrade-project');
var notSatisfied = chalk.yellow('WARNING: ') + 'The globally-installed LFA doesn\'t satisfy the project\'s dependency field. We encourage you to run ' + chalk.yellow('lfa upgrade-project') + '. Will now switch to the project\'s copy.';

module.exports = function compile(cli) {
  var projPath = cli.flags.book;
  var verbose = cli.flags.v || cli.flags.verbose;

  LFA.loadPaths(projPath).then(function (config) {
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
  }).then(function (config) {
    return LFA.loadProject(config);
  }).then(function (lfa) {
    process.stdout.write(chalk.green('compiling... '));

    var task = cli.input.length >= 2 ? cli.input[1] : null;
    return lfa.compile({
      task: task,
    });

  }).then(function () {
    console.log('done');
  }, function (err) {
    console.log(chalk.red('error'));
    console.log(verbose ? err.stack : (chalk.red(err.name) + chalk.blue(': ')  + err.message));
  });
};
