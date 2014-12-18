#!/usr/bin/env node

var LFA = require('../');

console.log('Welcome to LFA');

var projPath = './';

LFA.detectPaths(projPath).then(function (paths) {
  console.log(paths);
});
