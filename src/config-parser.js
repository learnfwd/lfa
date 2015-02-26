var _ = require('lodash');
var assert = require('assert');

function idToTitle(bookId) {
  //Get rid of commas and capitalize each word
  return bookId.replace(/-/, ' ').replace(/[^\s]+/g, function(word) {
    return word.replace(/^./, function(first) {
      return first.toUpperCase();
    });
  });
}

module.exports = function parseConfig(config) {
  assert(typeof(config.packagePath) === 'string', 'config.packagePath must be a string');
  assert(typeof(config.projectPath) === 'string', 'config.projectPath must be a string');
  assert(typeof(config.releaseBuildPath) === 'string', 'config.releaseBuildPath must be a string');
  assert(typeof(config.debugBuildPath) === 'string', 'config.debugBuildPath must be a string');
  assert(typeof(config.package) === 'object', 'config.package must be an object');
  assert(_.contains(config.package.keywords, 'lfa-book'), 'This is not the package.json of a LFA book');

  var packageJson = config.package;

  config.bookId = packageJson.name;
  assert(typeof(config.bookId) === 'string', 'packageJson.name must be a string');
  assert(/^[a-z0-9-]+$/.test(config.name), 'packageJson.name must only contain lowercase latin letters, digits and dashes');

  config.book = packageJson.book || {};
  assert(typeof(config.book) === 'object', 'packageJson.book must be an object');

  config.book.title = config.book.title || idToTitle(config.bookId);
  config.book.language = config.book.language || 'en';
  config.book.textDirection = config.book.textDirection || 'ltr';
  assert(typeof(config.book.title) === 'string', 'book.title must be a string');
  assert(typeof(config.book.language) === 'string', 'book.language must be a string');
  assert(typeof(config.book.textDirection) === 'string', 'book.textDirection must be a string');

  config.defaultTask = packageJson.defaultTask || 'default';

  return config;
};
