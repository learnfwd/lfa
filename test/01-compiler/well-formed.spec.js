/*global describe, it, before */
'use strict';
var LFA = require('../../');
var path = require('path');
var nodefn = require('when/node');
var fs = require('fs-extra');

var fixtures = path.resolve(__dirname, '..', 'fixtures');
var basicFixture = path.join(fixtures, 'basic');

describe('compiler', function () {
  var lfa = null;
  before('should compile a well-formed project', function () {
    return nodefn.call(fs.delete, path.join(basicFixture, '.lfa', 'build', 'debug'))
      .catch(function () {})
      .then(function () {
        return LFA.loadProject(basicFixture).then(function (_lfa) {
          lfa = _lfa;
          return lfa.compile();
        });
      });
  });

  it('should compile a well-formed project successfully', function () {
    return nodefn.call(fs.stat, lfa.config.buildPath)
      .then(function (stat) {
        stat.isDirectory().should.equal(true);
      });
  });
});
