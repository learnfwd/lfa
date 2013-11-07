var path = require('path'),
    current_directory = path.normalize(process.cwd()),
    shell = require('shelljs');

var _clean = function(){
  shell.rm('-rf', path.join(process.cwd(), options.output_folder));
  process.stdout.write(('deleting ' + options.output_folder + '\n').red)
};

module.exports = { execute: _clean, needs_config: true };
