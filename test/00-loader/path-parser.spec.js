/*global describe, it */
'use strict';
var LFA = require('../../');
var path = require('path');

var fixtures = path.resolve(__dirname, '..', 'fixtures');
var basicFixture = path.join(fixtures, 'basic');
var noKeywordFixture = path.join(fixtures, 'no-keyword');

describe('path parser', function () {
    it('should load paths correctly', function () {
      return LFA.loadPaths(basicFixture).then(function(config) {
        config.projectPath.should.equal(basicFixture);
        config.packagePath.should.equal(path.join(basicFixture, '.lfa', 'package.json'));
        config.debugBuildPath.should.equal(path.join(basicFixture, '.lfa', 'build', 'debug'));
        config.releaseBuildPath.should.equal(path.join(basicFixture, '.lfa', 'build', 'release'));
      });
    });

    it('should load paths correctly from subdirectory', function () {
      return LFA.loadPaths(path.join(basicFixture, 'text')).then(function(config) {
        config.projectPath.should.equal(basicFixture);
        config.packagePath.should.equal(path.join(basicFixture, '.lfa', 'package.json'));
        config.debugBuildPath.should.equal(path.join(basicFixture, '.lfa', 'build', 'debug'));
        config.releaseBuildPath.should.equal(path.join(basicFixture, '.lfa', 'build', 'release'));
      });
    });

    it('should accept config at path load time', function () {
      var conf = { path: basicFixture, randomConf: 'something' };
      return LFA.loadPaths(conf).then(function(config) {
        config.randomConf.should.equal(conf.randomConf);
      });
    });

    it('should error on wrong path', function () {
      return LFA.loadPaths(basicFixture + '_some_random_gibberish_').then(function () {
        throw new Error('Should have errored out on inexistent path');
      }).catch(function(err) {
        err.code.should.equal('ENOENT');
      });
    });

    it('should error on wrong type of package', function () {
      return LFA.loadPaths(noKeywordFixture).then(function () {
        throw new Error('Should have errored out on non-lfa project');
      }).catch(function(err) {
        err.message.should.equal('This is not the package.json of a LFA book');
      });
    });
});
