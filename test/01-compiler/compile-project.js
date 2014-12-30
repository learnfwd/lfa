'use strict';
var LFA = require('../../');
var path = require('path');
var nodefn = require('when/node');
var fs = require('fs-extra');

module.exports = function compileProject(fixture) {
  var _lfa;

  return nodefn.call(fs.delete, path.join(fixture, '.lfa', 'build'))
    .catch(function () {})
    .then(function () {
      return LFA.loadProject(fixture);
    })
    .then(function (lfa) {
      _lfa = lfa;
      return lfa.compile();
    })
    .then(function () {
      return _lfa;
    });
};
