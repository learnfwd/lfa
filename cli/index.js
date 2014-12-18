#!/usr/bin/env node

var LFA = require('../');

console.log('Welcome to LFA');

var projPath = './';

LFA.loadPaths(projPath).then(function (config) {
  return LFA.loadProject(config);
}).then(function (lfa) {
  console.log(lfa.config.package.name);
});
