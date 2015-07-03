var _ = require('lodash');
var nodefn = require('when/node');
var fs = require('fs');
var path = require('path');
var when = require('when');
var assert = require('assert');

var configParser = require('./config-parser');
var pluginLoader = require('./plugin-loader');

var Loader = {};
Loader.loadPaths = function (config) {
  if (typeof(config) !== 'object') {
    config = {
      path: config
    };
  }

  var projPath;
  var packagePath;
  var packageJson;
  var error; //Return the first error

  var detect = (config.pluginProject === 'detect');
  config.pluginProject = config.pluginProject || false;
  assert(detect || typeof(config.pluginProject) === 'boolean', 'config.pluginProject must be a boolean or "detect"');

  function tryOption(op) {
    return nodefn.call(fs.readFile, op.packagePath)
      .then(function (contents) {
        packageJson = JSON.parse(contents);
        var isBook = op.canBeBook && _.contains(packageJson.keywords, 'lfa-book');
        var isPlugin = op.canBePlugin && _.contains(packageJson.keywords, 'lfa-plugin');
        if (!isBook && !isPlugin) {
          throw new Error('This is not the package.json of a LFA book or plugin');
        }
        config.pluginProject = isPlugin;
        packagePath = op.packagePath;
      });
  }

  return when.try(function () {
    assert(typeof(config.path) === 'string', 'config.path must be a string');
    projPath = path.resolve(config.path);
  }).then(function tryPath() {
    var optionsToTry = [];

    if (detect || !config.pluginProject) {
      optionsToTry.push({
        packagePath: path.join(projPath, '.lfa', 'package.json'),
        canBeBook: true,
        canBePlugin: false,
      });
    }

    optionsToTry.push({
      packagePath: path.join(projPath, 'package.json'),
      canBeBook: detect || !config.pluginProject,
      canBePlugin: detect || !!config.pluginProject,
    });

    return tryOption(optionsToTry[0])
      .catch(function (err) {
        if (!error) { error = err; }
        if (optionsToTry.length <= 1) {
          throw err;
        }
        return tryOption(optionsToTry[1])
          .catch(function (err) {
            if (!error) { error = err; }
            throw err;
          });
      })
      .then(function () {
        var dotPath = config.pluginProject ? path.join(path.dirname(packagePath), '.lfa') : path.dirname(packagePath);
        var r = {
          packagePath: packagePath,
          package: packageJson,
          projectPath: path.resolve(path.dirname(packagePath), packageJson.projectPath || (config.pluginProject ? '.' : '..')),
          releaseBuildPath: path.join(dotPath, 'build', 'release'),
          debugBuildPath: path.join(dotPath, 'build', 'debug'),
          tmpPath: path.resolve(dotPath, 'build', 'tmp'),
        };
          
        return _.extend(config, r);
      })
      .catch(function (err) {
        if (!error) { error = err; }

        var up = path.join(projPath, '..');
        if (up !== projPath) {
          projPath = up;
          return tryPath();
        } else {
          throw error;
        }
      });
  }).then(function (r) {
    return r;
  });
};

Loader.loadProject = function(config)  {
  var LFA = this;

  var prom;
  if (typeof(config) !== 'object' ||
      typeof(config.packagePath) !== 'string' ||
      typeof(config.package) !== 'object' ||
      typeof(config.projectPath) !== 'string' ||
      typeof(config.tmpPath) !== 'string' ||
      typeof(config.releaseBuildPath) !== 'string' ||
      typeof(config.debugBuildPath) !== 'string' ||
      typeof(config.pluginProject) !== 'boolean'
  ) {
    prom = LFA.loadPaths(config).then(function (r) {
      config = r;
    });
  } else {
    prom = when();
  }

  var instance = null;

  return prom.then(function () {
    return configParser(config);
  }).then(function (conf) {
    return new LFA(conf);
  }).then(function (lfa) {
    instance = lfa; 
    return pluginLoader(lfa);
  }).then(function () {
    return instance;
  });
};

module.exports = Loader;
