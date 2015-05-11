var LFA = require('../../');
var chalk = require('chalk');
var switchControl = require('../switch');
var prettyErrors = require('../pretty-errors');
var when = require('when');
var openUrl = require('open');

module.exports = function compile(cli) {
  var projPath = cli.flags.book;
  var verbose = cli.flags.v || cli.flags.verbose;
  var port = cli.flags.p || cli.flags.port || process.env.PORT;
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
      port: port,
      verbose: !!verbose,
    });

    watcher.on('listening', function (port) {
      console.log(chalk.green('listening on port ') + chalk.yellow(port));
      if (open) {
        openUrl('http://localhost:' + port);
      }
    });

    var compilingShown = false;
    function showCompiling(text) {
      if (!compilingShown) {
        compilingShown = true;
        process.stdout.write(chalk.green('compiling... '));
      }
      if (text) {
        compilingShown = false;
        console.log(text);
      }
    }

    function dismissCompiling() {
      if (compilingShown) {
        compilingShown = false;
        console.log('');
      }
    }

    watcher.on('compiling', function () {
      showCompiling();
    });

    watcher.on('compile-done', function () {
      showCompiling('done');
    });

    var errorHandler = prettyErrors(verbose);

    watcher.on('compile-fatal-error', function (err) {
      showCompiling(chalk.red('error'));
      errorHandler(err);
    });

    watcher.on('compile-error', function (err) {
      dismissCompiling();
      console.log(chalk.red('Non-fatal Error') + ':');
      errorHandler(err);
    });

    watcher.on('compile-warning', function (err) {
      dismissCompiling();
      console.log(chalk.yellow('Warning') + ':');
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
