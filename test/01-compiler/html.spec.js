/*global describe, it, before */
'use strict';
var path = require('path');
var fs = require('fs');
var nodefn = require('when/node');
var compileProject = require('./compile-project');

var fixtures = path.resolve(__dirname, '..', 'fixtures');
var basicFixture = path.join(fixtures, 'basic');

describe('index.html', function () {
  var regexp = /<html[^<>]*>[^]*<\/html>/;

  // debug compiles take less

  it('should be compiled when just compiling user', function () {
    var lfa;
    return compileProject(basicFixture, { loadCore: false, loadPlugins: false }, { debug: true }).then(function (_lfa) {
      lfa = _lfa;
      var indexPath = path.join(lfa.config.debugBuildPath, 'index.html');
      return nodefn.call(fs.readFile, indexPath);
    }).then(function(data) {
      data.toString().should.match(regexp);
    });
  });

  it('should not be compiled when compiling without user', function () {
    var lfa;
    return compileProject(basicFixture, { loadUser: false }, { debug: true }).then(function (_lfa) {
      lfa = _lfa;
      var indexPath = path.join(lfa.config.debugBuildPath, 'index.html');
      return nodefn.call(fs.readFile, indexPath);
    }).then(function(data) {
      throw new Error('fs.readFile should have errored with ENOENT');
    }).catch(function(err) {
      err.message.should.match(/ENOENT/);
    });
  });

});
