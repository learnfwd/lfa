/*global describe, it, before */
'use strict';
var path = require('path');
var fs = require('fs');
var nodefn = require('when/node');
var compileProject = require('./compile-project');

var fixtures = path.resolve(__dirname, '..', 'fixtures');
var userFixture = path.join(fixtures, 'css-user');
var themeFixture = path.join(fixtures, 'css-theme');
var nothemeFixture = path.join(fixtures, 'css-theme-nostyles');
var noneFixture = path.join(fixtures, 'css-none');
var pluginFixture = path.join(fixtures, 'css-plugin');


describe('css compilation', function () {

  it('should compile user styles', function () {
    var lfa;
    return compileProject(userFixture, { loadCore: false }).then(function (_lfa) {
      lfa = _lfa;
      var cssFilePath = path.join(lfa.config.releaseBuildPath, 'book-main.css');
      return nodefn.call(fs.readFile, cssFilePath);
    }).then(function(data) {
      var regexp = /\.user-main/;
      data.toString().should.match(regexp);
    });
  });

  it('should compile project with no styles', function () {
    var lfa;
    return compileProject(noneFixture, { loadCore: false }).then(function (_lfa) {
      lfa = _lfa;
      var cssFilePath = path.join(lfa.config.releaseBuildPath, 'book-main.css');
      return nodefn.call(fs.readFile, cssFilePath);
    }).then(function(data) {
      var regexp = /\.user-main/;
      data.toString().should.not.match(regexp);
    });
  });

  it('should load stylus from plugin', function () {
    var lfa;
    return compileProject(pluginFixture, { loadCore: false }).then(function (_lfa) {
      lfa = _lfa;
      var cssFilePath = path.join(lfa.config.releaseBuildPath, 'book-main.css');
      return nodefn.call(fs.readFile, cssFilePath);
    }).then(function(data) {
      var regexp = /\.plugin-main/;
      data.toString().should.match(regexp);
    });
  });
});
