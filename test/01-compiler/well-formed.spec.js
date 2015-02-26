/*global describe, it*/
'use strict';
var path = require('path');
var nodefn = require('when/node');
var fs = require('fs-extra');
var compileProject = require('./compile-project');

var fixtures = path.resolve(__dirname, '..', 'fixtures');
var basicFixture = path.join(fixtures, 'basic');

describe('compiler', function () {

  it('should compile a well-formed project', function () {
    var lfa;
    return compileProject(basicFixture).then(function (_lfa) {
      lfa = _lfa;
      return nodefn.call(fs.stat, lfa.config.releaseBuildPath);
    }).then(function (stat) {
      stat.isDirectory().should.equal(true);
    });
  });

});
