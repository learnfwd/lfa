var assert = require('assert');
var path = require('path');
var when = require('when');
var nodefn = require('when/node');
var filewalker = require('filewalker');
var fs = require('fs');
var _ = require('lodash');

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
    var themes = packageJson.themes || {};

    var keywords = packageJson.keywords;
    assert((keywords instanceof Array) && _.contains(keywords, 'lfa-plugin'), 
      'Plugins must have "lfa-plugin" as a keyword in their package.json');
    
    var tasks = [];
    
    _.each(themes, function (themePath, name) {
      tasks.push(when.try(function () {
        themePath = path.resolve(pluginPath, path.normalize(themePath));
        var walker = filewalker(themePath, { maxAttempts: 0, });
        var themeFiles = {};

        return when.promise(function (resolve, reject) {

          walker.on('dir', function (p) {
            themeFiles[p] = 'dir';
          });

          walker.on('file', function (p) {
            themeFiles[p] = 'file';
          });

          walker.on('done', resolve);
          walker.on('error', reject);
          walker.walk();

        }).then(function () {
          lfa.themes[name] = {
            name: name,
            files: themeFiles,
            path: themePath,
          };
        });
      }));
    });

    var returnValue;

    tasks.push(when.try(function () {
      //TO DO: Make this async
      returnValue = require(pluginPath)(lfa);
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
        returnValue: returnValue,
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
          if (pluginPackageJson !== null) {
            plugins.push(loadPlugin(lfa, pluginPath, pluginPackageJson));
          }
        });
    }));

  });
}

module.exports = function pluginLoader(lfa) {
  return when.try(function () {
    lfa.themes = {};
  }).then(function () {
    var plugins = [
      loadPlugin(lfa, path.resolve(__dirname, '..', 'plugins', 'lfa-core'))
    ];

    return when.all([
      loadLocalPlugins(lfa, plugins),
    ]).then(function () {
      return when.all(plugins);
    });

  }).then(function (loadedPlugins) {
    lfa.plugins = loadedPlugins;

    var config = lfa.config;
    var themeName = config.package.theme || 'default';
    assert(typeof(themeName) === 'string', 'packageJson.theme must be a string');

    config.themeName = themeName;
    var defaultTheme = lfa.themes['default'];
    var theme = lfa.themes[themeName];
    lfa.defaultTheme = defaultTheme;
    lfa.theme = theme;

    if (typeof(theme) !== 'object') {
      throw new Error('Theme not found "' + themeName + '"');
    }
  });
};
