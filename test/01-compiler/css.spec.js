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
    return compileProject(userFixture).then(function (_lfa) {
      lfa = _lfa;
      var cssFilePath = path.join(lfa.config.releaseBuildPath, 'main.css');
      return nodefn.call(fs.readFile, cssFilePath);
    }).then(function(data) {
      var regexp = /\.user-colors[^]*\.user-main/;
      data.toString().should.match(regexp);
    });
  });

  it('should compile theme styles', function () {
    var lfa;
    return compileProject(themeFixture).then(function (_lfa) {
      lfa = _lfa;
      var cssFilePath = path.join(lfa.config.releaseBuildPath, 'main.css');
      return nodefn.call(fs.readFile, cssFilePath);
    }).then(function(data) {
      var regexp = /\.user-colors[^]*\.theme-colors[^]*\.theme-main[^]*\.user-main/;
      data.toString().should.match(regexp);
    });
  });

  it('should compile theme with no styles', function () {
    var lfa;
    return compileProject(nothemeFixture).then(function (_lfa) {
      lfa = _lfa;
      var cssFilePath = path.join(lfa.config.releaseBuildPath, 'main.css');
      return nodefn.call(fs.readFile, cssFilePath);
    }).then(function(data) {
      var regexp = /\.user-colors[^]*\.user-main/;
      data.toString().should.match(regexp);
    });
  });

  it('should compile project with no styles', function () {
    var lfa;
    return compileProject(noneFixture).then(function (_lfa) {
      lfa = _lfa;
      var cssFilePath = path.join(lfa.config.releaseBuildPath, 'main.css');
      return nodefn.call(fs.readFile, cssFilePath);
    }).then(function(data) {
      var regexp = /\.user-colors[^]*\.user-main/;
      data.toString().should.not.match(regexp);
    });
  });

  it('should load stylus from plugin', function () {
    var lfa;
    return compileProject(pluginFixture).then(function (_lfa) {
      lfa = _lfa;
      var cssFilePath = path.join(lfa.config.releaseBuildPath, 'main.css');
      return nodefn.call(fs.readFile, cssFilePath);
    }).then(function(data) {
      var regexp = /\.plugin-colors[^]*\.plugin-main/;
      data.toString().should.match(regexp);
    });
  });
});
