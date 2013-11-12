var lfa = require('../index'),
    path = require('path'),
    shell = require('shelljs');

var _compile = function(args){
  if (args['compress'] == undefined) { global.options.compress = true; }
  if (args['components'] !== undefined) { global.options.components = args['components']; }
  
  shell.rm('-rf', path.join(process.cwd(), options.output_folder));
  lfa.compile_project(process.cwd(), function(){});

  args['compress'] == undefined && process.stdout.write('\nminifying & compressing...\n'.grey);
};

module.exports = { execute: _compile, needs_config: true };
