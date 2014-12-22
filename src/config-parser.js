var _ = require('lodash');
var assert = require('assert');

module.exports = function parseConfig(config) {
  assert(typeof(config.packagePath) === 'string', 'config.packagePath must be a string');
  assert(typeof(config.projectPath) === 'string', 'config.projectPath must be a string');
  assert(typeof(config.buildPath) === 'string', 'config.buildPath must be a string');
  assert(typeof(config.package) === 'object', 'config.package must be an object');
  assert(_.contains(config.package.keywords, 'lfa-book'), 'This is not the package.json of a LFA book');

  var packageJson = config.package;

  function idToTitle(bookId) {
    //Get rid of commas and capitalize each word
    return bookId.replace(/-/, ' ').replace(/[^\s]+/g, function(word) {
      return word.replace(/^./, function(first) {
        return first.toUpperCase();
      });
    });
  }

  config.bookId = packageJson.name;
  assert(typeof(config.bookId) === 'string', 'packageJson.name must be a string');
  assert(/^[a-z0-9-]+$/.test(config.name), 'packageJson.name must only contain lowercase latin letters, digits and dashes');

  config.meta = packageJson.meta || {};
  assert(typeof(config.meta) === 'object', 'packageJson.meta must be an object');

  config.meta.title = config.meta.title || idToTitle(config.bookId);

  config.defaultTask = packageJson.defaultTask || 'default';

  return config;
};
