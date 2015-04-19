/*global describe, it, before */
'use strict';
var path = require('path');
var fs = require('fs');
var nodefn = require('when/node');
var compileProject = require('./compile-project');

var fixtures = path.resolve(__dirname, '..', 'fixtures');
var basicFixture = path.join(fixtures, 'basic');

describe('index.html compilation', function () {

  it('should compile index.html', function () {
    var lfa;
    return compileProject(basicFixture).then(function (_lfa) {
      lfa = _lfa;
      var indexPath = path.join(lfa.config.releaseBuildPath, 'index.html');
      return nodefn.call(fs.readFile, indexPath);
    }).then(function(data) {
      var regexp = /<html[^<>]*>.*<\/html>/;
      regexp.test(data.toString()).should.equal(true);
    });
  });

});
