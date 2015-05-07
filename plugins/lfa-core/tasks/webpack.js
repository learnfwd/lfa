var through = require('through2');
var path = require('path');
var webpack = require('webpack');
var _ = require('lodash');
var when = require('when');

var templatesJS = require('./js-templates');
var entrypointsJS = require('./js-entrypoints');
var buildInfoJS = require('./js-build-info');
var liveReloadJS = require('./js-live-reload');
var stylusSettings = require('./stylus-settings');

module.exports = function webpackTasks(lfa) {
  templatesJS(lfa);
  entrypointsJS(lfa);
  buildInfoJS(lfa);
  liveReloadJS(lfa);

  lfa.task('webpack:deps:gen', ['webpack:gen:*'], function (generatedFiles) {
    this.setDependencyMode(generatedFiles, 'modify');
    return generatedFiles
      .pipe(lfa.hook('tmp-pre-write:*'))
      .pipe(lfa.hook('webpack:tmp-pre-write:*'))
      .pipe(lfa.dst(lfa.config.tmpPath))
      .pipe(lfa.hook('webpack:tmp-post-write:*'))
      .pipe(lfa.hook('tmp-post-write:*'));
  });

  lfa.task('default:webpack', ['webpack:deps:*'], function (deps) {
    var stream = lfa.pipeErrors(through.obj());
    var stylusSettingsPromise = stylusSettings(lfa);

    var aliases = {};

    deps.on('error', function (err) {
      stream.emit('error', err);
    });

    deps.on('data', function (file) {
      var al = file.webpackAlias;
      if (al) {
        if (typeof(al) === 'string') {
          al = [ al ];
        }
        var filePath = path.join(lfa.config.tmpPath, file.relative);
        _.each(al, function (alias) {
          aliases[alias] = filePath;
        });
      }
    });

    deps.on('end', function () {
      when.try(function () {
        var compiler = (lfa.previousCompile && lfa.previousCompile.webpackCompiler) ||
                       (lfa.currentCompile.watcher && lfa.currentCompile.watcher.webpackCompiler);
        if (compiler) { return compiler; }

        return stylusSettings(lfa).then(function (stylusConfig) {
          var resolveFallback = [];

          aliases.userland = path.join(lfa.config.projectPath, 'js');
          aliases.underscore = 'lodash';
          _.each(lfa.plugins, function (plugin) {
            aliases[plugin.name] = path.join(plugin.path, 'frontend', 'js');
            resolveFallback.push(path.join(plugin.path, 'web_modules'));
          });

          resolveFallback.push(path.join(lfa.path, 'web_modules'));
          resolveFallback.push(path.join(lfa.path, 'node_modules'));

          _.each(lfa.plugins, function (plugin) {
            resolveFallback.push(path.join(plugin.path, 'node_modules'));
          });

          var wpPlugins = [];
          var mainEntrypoints = [];
          if (lfa.currentCompile.serve && lfa.currentCompile.watcher.opts.hot) {
            wpPlugins.push(new webpack.HotModuleReplacementPlugin());
            mainEntrypoints.push('webpack/hot/dev-server');
          }

          mainEntrypoints.push(path.join(lfa.config.tmpPath, 'gen', 'index.js'));

          var webpackConfig = {
            entry: {
              main: mainEntrypoints,
            },
            output: {
              path: lfa.currentCompile.buildPath,
              filename: 'main.js',
            },
            debug: !!lfa.currentCompile.debug,
            devtool: lfa.currentCompile.debug ? 'eval-source-map' : undefined,
            module: {
              loaders: [
                { test: /\.jsx$/, loaders: ['react-hot', 'jsx?harmony'] },
                { test: /\.json$/, loaders: ['json-loader'] },
                { test: /\.css$/, loaders: ['style-loader', 'css-loader'] },
                { test: /\.styl$/, loaders: ['style-loader', 'css-loader', 'stylus-loader'] },
              ]
            },
            resolve: {
              alias: aliases,
              extensions: ['', '.js', '.jsx', 'json'],
              fallback: resolveFallback,
            },
            resolveLoader: {
              fallback: resolveFallback,
            },
            plugins: wpPlugins,
            stylus: stylusConfig,
          };

          return webpackConfig;
        }).then(function(webpackConfig) {
          var compiler = webpack(webpackConfig);
          lfa.currentCompile.webpackCompiler = compiler; 
          if (lfa.currentCompile.watcher) { 
            lfa.currentCompile.watcher.webpackCompiler = compiler;
          }
          return compiler;
        });
      }).then(function (compiler) {
        if (lfa.currentCompile.serve) {
          stream.end();
          return;
        }

        compiler.run(function (err, st) {
          try {
            if (err) { throw err; }
            var stats = st.toJson({ errors: true, warnings: true });
            if (stats.errors.length) {
              throw stats.errors[0];
            }
            // Treat warnings as errors
            if (lfa.currentCompile.warningsAsErrors && stats.warnings.length) {
              throw stats.warnings[0];
            }
            stream.end();
          } catch (err) {
            stream.emit('error', err);
          }
        });
      });
    });

    return stream;
  });
};
