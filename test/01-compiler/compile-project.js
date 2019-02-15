'use strict';
var LFA = require('../../');
var path = require('path');
var fs = require('fs-extra');

module.exports = function compileProject(fixture, loadingOpts, compileOpts) {
  var _lfa;

  return fs.remove(path.join(fixture, '.lfa', 'build'))
    .catch(function () {})
    .then(function () {
      loadingOpts = loadingOpts || {};
      loadingOpts.path = fixture;
      return LFA.loadProject(loadingOpts);
    })
    .then(function (lfa) {
      _lfa = lfa;
      return lfa.compile(compileOpts);
    })
    .then(function () {
      return _lfa;
    });
};
