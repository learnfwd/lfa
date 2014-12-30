/*global describe, it*/
'use strict';
var LFA = require('../../');
var path = require('path');

var fixtures = path.resolve(__dirname, '..', 'fixtures');
var customPluginFixture = path.join(fixtures, 'custom-plugin');
var invalidPluginFixture = path.join(fixtures, 'invalid-plugin');
var malformedPluginFixture = path.join(fixtures, 'malformed-plugin');

describe('plugins', function () {
  it('should be loaded from the "plugins" local directory', function () {
    return LFA.loadProject(customPluginFixture).then(function (lfa) {
      lfa.config.customModuleLoaded.should.equal(true);
    });
  });

  it('should ignore invalid plugins from "plugins"', function () {
    return LFA.loadProject(invalidPluginFixture);
  });

  it('should error out on malformed plugins', function () {
    return LFA.loadProject(malformedPluginFixture)
      .then(function () {
        throw new Error('Should have errored out');
      }, function (err) {
        err.message.should.equal('Plugins must have "lfa-plugin" as a keyword in their package.json');
      });
  });
});
