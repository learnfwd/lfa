var path = require('path'),
    current_directory = path.normalize(process.cwd()),
    shell = require('shelljs');

var _update = function(){
  shell.echo('trying to `npm update -g lfa`');
  shell.exec('npm update -g lfa');
};

module.exports = { execute: _update};