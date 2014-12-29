var LFA = require('../../');
var chalk = require('chalk');
var switchControl = require('../switch');

module.exports = function compile(cli) {
  var projPath = cli.flags.book;
  var verbose = cli.flags.v || cli.flags.verbose;

  LFA.loadPaths(projPath).then(function (config) {
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
    }).then(function () {
      console.log('done');
    }).catch(function (err) {
      console.log(chalk.red('error'));
      throw err;
    });

  }).catch(function (err) {
    if (verbose) {
      console.log(err.stack.replace(new RegExp('^' + err.name + ':'), chalk.red(err.name) + chalk.blue(': ')));
    } else {
      console.log(chalk.red(err.name) + chalk.blue(': ')  + err.message);
    }
    process.exit(-1);
  });
};
