var LFA = require('../../');
var chalk = require('chalk');
var switchControl = require('../switch');

module.exports = function compile(cli) {
  var projPath = cli.flags.book;
  var verbose = cli.flags.v || cli.flags.verbose;

  LFA.loadPaths(projPath).then(function (config) {
    return switchControl(cli, config);
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
