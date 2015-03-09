var LFA = require('../../');
var chalk = require('chalk');
var switchControl = require('../switch');
var prettyErrors = require('../pretty-errors');
var when = require('when');
var openUrl = require('open');

module.exports = function compile(cli) {
  var projPath = cli.flags.book;
  var verbose = cli.flags.v || cli.flags.verbose;
  var open = cli.flags.open;
  if (open === undefined) { open = true; }

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
    var task = cli.input.length >= 2 ? cli.input[1] : null;
    var watcher = lfa.watch({
      task: task,
      serve: true,
    });

    watcher.on('listening', function (port) {
      console.log(chalk.green('listening on port ') + chalk.yellow(port));
      if (open) {
        openUrl('http://localhost:' + port);
      }
    });

    watcher.on('compiling', function () {
      process.stdout.write(chalk.green('compiling... '));
    });

    watcher.on('compile-done', function () {
      console.log('done');
    });

    var errorHandler = prettyErrors(verbose);

    watcher.on('compile-error', function (err) {
      console.log(chalk.red('error'));
      errorHandler(err);
    });

    var prom = when.promise(function (resolve, reject) {
      watcher.on('stopped', resolve);
      watcher.on('fatal-error', reject);
    });

    watcher.start();

    return prom;
  }).catch(prettyErrors(verbose));
};
