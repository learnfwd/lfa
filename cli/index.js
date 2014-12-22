#!/usr/bin/env node

var path = require('path');
var meow = require('meow');

var cli = meow({
  help: require('./help'),
  pkg: path.join('..', 'package.json'),
  minimistOptions: {
    strings: ['book'],
  },
});

cli.flags.book = cli.flags.book || './';

var command;
var commandModule = './commands/' + cli.input[0];

try {
  command = require(commandModule);
} catch (ex) {
  if (ex.message === 'Cannot find module \'' + commandModule + '\'') {
    cli.showHelp();
  } else {
    throw ex;
  }
}

command(cli);
