var lfa = require('../index');
require('colors');

var _watch = function(args){
  var port = args.port;
  if (port === undefined) {
    port = process.env.PORT;
  }
  if (port !== undefined) {
    if (!((typeof(port) === 'string' || typeof(port) === 'number') &&
        !isNaN(port = parseInt(port)) && port > 0 && port < 65536)) {
      console.log('warning: '.yellow + 'invalid port number. will revert to default'.grey);
      port = undefined;
    }
  }

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

    var opts = {
      open: args.open === undefined ? true : args.open,
      port: port,
      debug: args.debug,
    };
    proj.watch(opts);

  }, function(ex) {
    process.stdout.write('error'.red + '\n');
    console.log(ex.stack);
  });
};

module.exports = { execute: _watch };
