var lfa = require('../index');
require('colors');

var _watch = function(){
  var proj = new lfa.Project(process.cwd());
  process.stdout.write('loading project... '.grey);
  proj.loaded.done(function () {
    process.stdout.write('done'.yellow + '\n');

    proj.on('compile-start', function() {
      process.stdout.write('compiling...'.grey);
    });
    proj.on('compile-done', function() {
      process.stdout.write('done'.yellow + '\n');
    });
    proj.on('compile-error', function(ex) {
      process.stdout.write('error'.red + '\n');
      console.log(ex.stack);
    });

    proj.on('server-start', function() {
      process.stdout.write('starting server...\n'.grey);
    });
    proj.on('server-error', function(ex) {
      process.stdout.write('Cannot start server:'.red + '\n');
      console.log(ex.stack);
    });

    proj.watch();

  }, function(ex) {
    process.stdout.write('error'.red + '\n');
    console.log(ex.stack);
  });
};

module.exports = { execute: _watch };
