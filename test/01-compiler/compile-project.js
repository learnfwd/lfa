'use strict';
var LFA = require('../../');
var path = require('path');
var nodefn = require('when/node');
var fs = require('fs-extra');

module.exports = function compileProject(fixture, loadingOpts, compileOpts) {
  var _lfa;

  return nodefn.call(fs.delete, path.join(fixture, '.lfa', 'build'))
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
