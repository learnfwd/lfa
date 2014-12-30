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


describe('css compilation', function () {

  it('should compile user styles', function () {
    var lfa;
    return compileProject(userFixture).then(function (_lfa) {
      lfa = _lfa;
      var cssFilePath = path.join(lfa.config.buildPath, 'main.css');
      return nodefn.call(fs.readFile, cssFilePath);
    }).then(function(data) {
      var regexp = /\.user-colors[^]*\.user-main/;
      regexp.test(data.toString()).should.equal(true);
    });
  });

  it('should compile theme styles', function () {
    var lfa;
    return compileProject(themeFixture).then(function (_lfa) {
      lfa = _lfa;
      var cssFilePath = path.join(lfa.config.buildPath, 'main.css');
      return nodefn.call(fs.readFile, cssFilePath);
    }).then(function(data) {
      var regexp = /\.user-colors[^]*\.theme-colors[^]*\.theme-main[^]*\.user-main/;
      regexp.test(data.toString()).should.equal(true);
    });
  });

  it('should compile theme with no styles', function () {
    var lfa;
    return compileProject(nothemeFixture).then(function (_lfa) {
      lfa = _lfa;
      var cssFilePath = path.join(lfa.config.buildPath, 'main.css');
      return nodefn.call(fs.readFile, cssFilePath);
    }).then(function(data) {
      var regexp = /\.user-colors[^]*\.user-main/;
      regexp.test(data.toString()).should.equal(true);
    });
  });

  it('should compile project with no styles', function () {
    var lfa;
    return compileProject(noneFixture).then(function (_lfa) {
      lfa = _lfa;
      var cssFilePath = path.join(lfa.config.buildPath, 'main.css');
      return nodefn.call(fs.readFile, cssFilePath);
    }).then(function(data) {
      var regexp = /\.user-colors[^]*\.user-main/;
      regexp.test(data.toString()).should.equal(false);
    });
  });

});
