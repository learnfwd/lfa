var lfa = require('../index'),
    path = require('path'),
    shell = require('shelljs');

var compile = function(args){
  if (args['compress'] === undefined) { global.options.compress = true; }
  if (args['components'] !== undefined) { global.options.components = args['components']; }
  if (args['output'] !== undefined) { global.options.output_format = args['output']; }
  
  shell.rm('-rf', path.join(process.cwd(), global.options.output_folder));
  lfa.compile_project(process.cwd(), function(){});

  if (global.options.compress) { process.stdout.write('\nminifying & compressing...\n'.grey); }
};

module.exports = { execute: compile, needs_config: true };
