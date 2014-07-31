var lfa = require('../');

var proj = new lfa.Project(process.argv[2]);
proj.loaded.done(function () {
  /*process.send = function(msg) {
    process.stderr.write(JSON.stringify(msg));
  };*/
  process.send({msg: 'load-done'});

  proj.on('compile-start', function() {
    process.send({msg: 'compile-start'});
  });
  proj.on('compile-done', function() {
    process.send({msg: 'compile-done'});
  });
  proj.on('compile-error', function(ex) {
    process.send({msg: 'compile-error', err:ex});
  });

  proj.on('server-start', function() {
    process.send({msg: 'server-start'});
  });
  proj.on('server-done', function() {
    process.send({msg: 'server-done'});
  });
  proj.on('server-error', function(ex) {
    process.send({msg: 'server-error', err:ex});
  });

  proj.on('watcher-start', function() {
    process.send({msg: 'watcher-start'});
  });
  proj.on('watcher-done', function() {
    process.send({msg: 'watcher-done'});
  });
  proj.on('watcher-error', function(ex) {
    process.send({msg: 'watcher-error', err:ex});
  });

  proj.watch();

  process.on('message', function(msg) {
    if (msg === 'exit') {
      process.exit(0);
    }
  });
}, function(ex) {
  process.send({msg: 'load-error', err:ex});
});
