// Monkey patch pipe() to pass errors downstream
var pipeErrors = require('./pipe-errors').monkeyPatch();
var gutil = require('gulp-util');
gutil.noop = pipeErrors.patchFunction(gutil.noop.bind(gutil));

var assert = require('assert');
var path = require('path');
var when = require('when');
var nodefn = require('when/node');
var fs = require('fs');
var _ = require('lodash');
var child_process = require('child_process');

function loadPlugin(lfa, pluginPath, packageJson) {
  var promise;
  /* istanbul ignore else */
  if (typeof(packageJson) !== 'string') {
    promise = nodefn.call(fs.readFile, path.join(pluginPath, 'package.json'))
      .then(function (data) {
        return JSON.parse(data);
      });
  } else {
    promise = when(packageJson);
  }

  return promise.then(function (packageJson) {
    var keywords = packageJson.keywords;
    assert((keywords instanceof Array) && _.includes(keywords, 'lfa-plugin'), 
      'Plugins must have "lfa-plugin" as a keyword in their package.json');

    if (packageJson.lfa === undefined) { packageJson.lfa = {}; };
    assert(typeof(packageJson.lfa) === 'object', 'The "lfa" key in a plugin\'s package.json must be an object');

    if (!_.isEmpty(packageJson.dependencies || {})) {
      // TODO: Also run npm install when dependencies out of date
      return nodefn.call(fs.stat, path.join(pluginPath, 'node_modules'))
        .then(function (stat) {
          return stat.isDirectory();
        })
        .catch(function () {
          return false;
        })
        .then(function (hasNodeModules) {
          if (hasNodeModules) { return; }
          return when.promise(function (resolve, reject) {
            child_process.exec('npm install', { cwd: pluginPath }, function (error, stdout, stderr) {
              if (error) { reject(error); return; }
              resolve();
            });
          });
        })
        .then(function() {
          return packageJson;
        });
    }
    return packageJson;

  }).then(function (packageJson) {
    
    var tasks = [];

    var pluginModule;

    tasks.push(when.try(function () {
        //TO DO: Make this async
        pluginModule = require(pluginPath);
      }).catch(function (err) {
        if (err.message !== 'Cannot find module \'' + pluginPath + '\'') {
          throw err;
        }
      })
    );

    return when.all(tasks).then(function () {
      return {
        path: pluginPath,
        name: packageJson.name,
        package: packageJson,
        module: pluginModule,
      };
    });
  });
}

function loadLocalPlugins(lfa, plugins) {
  var pluginsPath = path.resolve(lfa.config.projectPath, 'plugins');

  return nodefn.call(fs.readdir, pluginsPath).catch(function () {
    return []; //Not a big deal if there's no "plugins" folder
  }).then(function (files) {
    return when.all(_.map(files, function (file) {
      var pluginPath = path.resolve(pluginsPath, file);
      return nodefn.call(fs.readFile, path.resolve(pluginPath, 'package.json'))
        .then(function (data) {
          return JSON.parse(data);
        })
        .catch(function () {
          // Ignoring non-plugin files and folders
          return null;
        })
        .then(function (pluginPackageJson) {
          if (lfa.config.loadPluginFilter && pluginPackageJson.name !== lfa.config.loadPluginFilter) {
            pluginPackageJson = null;
          }
          if (pluginPackageJson !== null) {
            plugins.push(loadPlugin(lfa, pluginPath, pluginPackageJson));
          }
        });
    }));

  });
}

function loadBuiltInPlugin(lfa, pluginName) {
  return loadPlugin(lfa, path.resolve(__dirname, '..', 'plugins', pluginName));
}

module.exports = function pluginLoader(lfa) {
  return when.try(function () {

    var plugins = [ loadBuiltInPlugin(lfa, 'lfa-compilation'), loadBuiltInPlugin(lfa, 'lfa-analytics') ];

    if (lfa.config.pluginProject) {
      plugins.push(loadPlugin(lfa, lfa.config.projectPath, lfa.config.packageJson));
      return plugins;
    }

    if (lfa.config.loadCore) {
      plugins.push(loadBuiltInPlugin(lfa, 'lfa-core'));
    }

    var tasks = [];

    if (lfa.config.loadPlugins) {
      tasks.push(loadLocalPlugins(lfa, plugins));
    }

    return when.all(tasks).then(function () {
      if (lfa.config.loadUser) {
        plugins.push(loadBuiltInPlugin(lfa, 'lfa-book'));
        plugins.push(loadBuiltInPlugin(lfa, 'lfa-user'));
      }
      return plugins;
    });

  }).then(function (plugins) {
    return when.all(plugins);
  }).then(function (loadedPlugins) {
    lfa.plugins = loadedPlugins;
    _.each(loadedPlugins, function (plugin) {
      if (plugin.module) {
        plugin.module.call(plugin, lfa);
      }
    });
  });
};
