var LFA = require('../../');
var chalk = require('chalk');
var switchControl = require('../switch');
var when = require('when');
var openUrl = require('open');
var prettyErrors = require('../pretty-errors');
var configFlags = require('../config-flags');
var EventOutput = require('../event-output');

module.exports = function compile(cli) {
  var projPath = cli.flags.book;
  var verbose = cli.flags.v || cli.flags.verbose;
  var serve = (typeof(cli.flags.serve) === 'boolean') ? cli.flags.serve : true;
  var port = cli.flags.p || cli.flags.port || process.env.PORT;
  var open = cli.flags.open;
  var bundleName = cli.flags.bundleName;
  if (open === undefined) { open = true; }

  return LFA.loadPaths(projPath).then(function (config) {
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
    var task = cli.input.length >= 2 ? cli.input[1] : null;
    var watcher = lfa.watch({
      task: task,
      serve: serve,
      port: port,
      bundleName: bundleName,
      verbose: !!verbose,
    });

    var output = new EventOutput(lfa, verbose);

    watcher.on('listening', function (port) {
      output.dismissCompiling();
      console.log(chalk.green('listening on port ') + chalk.yellow(port));
      if (open) {
        openUrl('http://localhost:' + port);
      }
    });

    var prom = when.promise(function (resolve, reject) {
      watcher.on('stopped', resolve);
      watcher.on('fatal-error', reject);
    });

    watcher.start();

    return prom;
  }).catch(prettyErrors(verbose));
};
