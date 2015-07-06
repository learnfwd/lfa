/*global describe, it, before */
'use strict';
var LFA = require('../../');
var path = require('path');
var _ = require('lodash');

var fixtures = path.resolve(__dirname, '..', 'fixtures');
var basicFixture = path.join(fixtures, 'basic');

describe('project loader', function () {

  it('should load correctly with no hints', function () {
    return LFA.loadProject(basicFixture);
  });

  describe('should load correctly with hints', function () {
    var basicConfig;
    function newConf() {
      return _.cloneDeep(basicConfig);
    }

    before(function () {
      return LFA.loadPaths(basicFixture).then(function (config) {
        basicConfig = _.cloneDeep(config);
      });
    });

    it ('that are correct', function () {
      return LFA.loadProject(newConf());
    });

    describe('that are incomplete', function () {
      it('w/o packagePath', function () {
        return LFA.loadProject(_.defaults(newConf(), {
          packagePath: null,
        }));
      });

      it('w/o package', function () {
        return LFA.loadProject(_.defaults(newConf(), {
          package: null,
        }));
      });

      it('w/o projectPath', function () {
        return LFA.loadProject(_.defaults(newConf(), {
          projectPath: null,
        }));
      });

      it('w/o buildPath', function () {
        return LFA.loadProject(_.defaults(newConf(), {
          buildPath: null,
        }));
      });
    });
  });

});
