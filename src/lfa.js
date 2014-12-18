var _ = require('lodash');
var nodefn = require('when/node');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var when = require('when');

function LFA(config) {
  if (typeof(config) !== 'object') {
    throw new Error("private constructor. Use LFA.loadProject()");
  }
  this.config = config;
  this._initTasks();
}

_.extend(LFA.prototype, require('./tasks'));

LFA.loadPaths = function (config) {
  if (typeof(config) !== 'object') {
    config = {
      path: config
    };
  }

  var projPath;
  var packagePath;
  var packageJson;
  var error; //Return the first error

  return when.try(function () {
    assert(typeof(config.path) === 'string', 'config.path must be a string');
    projPath = path.resolve(config.path);
  }).then(function tryPath() {
    packagePath = path.join(projPath, '.lfa', 'package.json');
    return when.try(function () {
      return nodefn.call(fs.readFile, packagePath);
    }).catch(function (err) {
      if (!error) { error = err; }
      packagePath = path.join(projPath, 'package.json');
      return nodefn.call(fs.readFile, packagePath);
    }).catch(function () {
      throw error;
    }).then(function (contents) {
      packageJson = JSON.parse(contents);
      assert(_.contains(packageJson.keywords, 'lfa-book'), 'This is not the package.json of a LFA book');
      
      var r = {
        packagePath: packagePath,
        package: packageJson,
        projectPath: path.resolve(path.dirname(packagePath), packageJson.projectPath || '..'),
        buildPath: path.join(path.dirname(packagePath), 'build', 'debug')
      };
        
      return _.extend(config, r);
    }).catch(function (err) {
      if (!error) { error = err; }

      var up = path.join(projPath, '..');
      if (up !== projPath) {
        projPath = up;
        return tryPath();
      } else {
        throw error;
      }
    });
  });
};

LFA.loadProject = function(config)  {
  var prom;
  if (typeof(config) !== 'object' ||
      typeof(config.packagePath) !== 'string' ||
      typeof(config.package) !== 'object' ||
      typeof(config.projectPath) !== 'string' ||
      typeof(config.buildPath) !== 'string'
  ) {
    console.log(config);

    prom = LFA.loadPaths(config).then(function (r) {
      config = r;
    });
  } else {
    prom = when();
  }

  return prom.then(function () {
    assert(typeof(config.packagePath) === 'string', 'config.packagePath must be a string');
    assert(typeof(config.projectPath) === 'string', 'config.projectPath must be a string');
    assert(typeof(config.buildPath) === 'string', 'config.buildPath must be a string');
    assert(typeof(config.package) === 'object', 'config.package must be an object');
    assert(_.contains(config.package.keywords, 'lfa-book'), 'This is not the package.json of a LFA book');

    return new LFA(config);
  });
};

module.exports = LFA;
