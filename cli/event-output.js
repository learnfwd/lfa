var prettyErrors = require('./pretty-errors');
var chalk = require('chalk');

function EventOutput(lfa, verbose) {
  var self = this;
  self.compilingShown = false;

  lfa.on('compile-started', function () {
    self.showCompiling();
  });

  lfa.on('compile-done', function () {
    self.showCompiling('done');
  });

  var errorHandler = prettyErrors(verbose);

  lfa.on('compile-fatal-error', function (err) {
    self.showCompiling(chalk.red('error'));
    errorHandler(err);
  });

  lfa.on('compile-error', function (err) {
    self.dismissCompiling();
    process.stdout.write(chalk.red('Non-fatal Error') + ': ');
    errorHandler(err);
  });

  lfa.on('compile-notice', function (err) {
    self.dismissCompiling();
    process.stdout.write(chalk.blue('Notice') + ': ');
    errorHandler(err);
  });

  lfa.on('compile-warning', function (err) {
    self.dismissCompiling();
    process.stdout.write(chalk.yellow('Warning') + ': ');
    errorHandler(err);
  });
}

EventOutput.prototype.showCompiling = function showCompiling(text) {
  if (!this.compilingShown) {
    this.compilingShown = true;
    process.stdout.write(chalk.green('compiling... '));
  }
  if (text) {
    this.compilingShown = false;
    console.log(text);
  }
};

EventOutput.prototype.dismissCompiling = function dismissCompiling() {
  if (this.compilingShown) {
    this.compilingShown = false;
    console.log('');
  }
};

module.exports = EventOutput;
