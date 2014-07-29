var lfa = require('../index');
require('colors');

var _compile = function(){
  var proj = new lfa.Project(process.cwd());
  process.stdout.write('loading project... '.grey);
  proj.loaded.done(function () {
    process.stdout.write('done'.yellow + '\n');
    process.stdout.write('compiling... '.grey);
    proj.compile().done(function() {
        process.stdout.write('done'.yellow + '\n');
      }, function(ex) {
        process.stdout.write('error'.red + '\n');
        console.log(ex.stack);
      });
  }, function(ex) {
    process.stdout.write('error'.red + '\n');
    console.log(ex.stack);
  });
};

module.exports = { execute: _compile };
