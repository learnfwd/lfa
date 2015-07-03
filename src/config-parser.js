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
  assert(typeof(config.tmpPath) === 'string', 'config.tmpPath must be a string');
  assert(typeof(config.releaseBuildPath) === 'string', 'config.releaseBuildPath must be a string');
  assert(typeof(config.debugBuildPath) === 'string', 'config.debugBuildPath must be a string');
  assert(typeof(config.package) === 'object', 'config.package must be an object');
  assert(typeof(config.pluginProject) === 'boolean', 'config.pluginProject must be a boolean');
  if (config.pluginProject) {
    assert(_.contains(config.package.keywords, 'lfa-plugin'), 'This is not the package.json of a LFA plugin');
  } else { 
    assert(_.contains(config.package.keywords, 'lfa-book'), 'This is not the package.json of a LFA book');
  }

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

  packageJson.lfa = packageJson.lfa || {};
  assert(typeof(packageJson.lfa) === 'object', 'packageJson.lfa must be an object');

  function def(type, key1, key2, deflt) {
    var a = config[key1];
    if (a !== undefined) { 
      assert(typeof(a) === type, 'config.' + key1 + ' must be a ' + type);
      return;
    }

    var b = packageJson.lfa[key2];
    if (b !== undefined) { 
      assert(typeof(b) === type, 'packageJson.lfa.' + key2 + ' must be a ' + type);
      config[key1] = b;
      return;
    }

    config[key1] = deflt;
  }

  def('boolean', 'loadCore', 'compileCore', true);
  def('boolean', 'loadPlugins', 'compilePlugins', true);
  def('boolean', 'loadUser', 'compileUser', true);

  config.externalPlugins = config.externalPlugins || [];
  var externalPlugins = packageJson.lfa.externalPlugins || [];
  assert(config.externalPlugins instanceof Array, 'config.externalPlugins must be an array');
  assert(externalPlugins instanceof Array, 'packageJson.lfa.externalPlugins must be an array');
  config.externalPlugins = externalPlugins.concat(config.externalPlugins);

  return config;
};
