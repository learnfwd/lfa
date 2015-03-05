var through = require('through2');
var path = require('path');
var webpack = require('webpack');
var templatesJS = require('./js-templates');
var entrypointsJS = require('./js-entrypoints');
var buildInfoJS = require('./js-build-info');
var _ = require('lodash');

module.exports = function webpackTasks(lfa) {
  templatesJS(lfa);
  entrypointsJS(lfa);
  buildInfoJS(lfa);

  lfa.task('webpack:deps:gen', ['webpack:gen:*'], function (generatedFiles) {
    return generatedFiles
      .pipe(lfa.hook('webpack:gen-pre-write:*'))
      .pipe(lfa.dst(lfa.config.tmpPath))
      .pipe(lfa.hook('webpack:gen-post-write:*'));
  });

  lfa.task('default:webpack', ['webpack:deps:*'], function (deps) {
    var stream = lfa.pipeErrors(through.obj());

    var aliases = {};

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
      var compiler = (lfa.previousCompile && lfa.previousCompile.webpackCompiler) ||
                     (lfa.currentCompile.watcher && lfa.currentCompile.watcher.webpackCompiler);

      if (!compiler) {

        aliases.userland = path.join(lfa.config.projectPath, 'js');
        aliases.underscore = 'lodash';
        _.each(lfa.plugins, function (plugin) {
          aliases[plugin.name] = path.join(plugin.path, 'frontend', 'js');
        });

        var webpackConfig = {
          entry: {
            main: path.join(lfa.config.tmpPath, 'gen', 'index.js'),
          },
          output: {
            path: lfa.currentCompile.buildPath,
            filename: 'main.js',
          },
          debug: !!lfa.currentCompile.debug,
          devtool: lfa.currentCompile.debug ? 'eval-source-map' : undefined,
          module: {
            loaders: [
              { test: /\.jsx$/, loader: 'jsx' },
              { test: /\.json$/, loader: 'json' },
              { test: /\.css$/, loader: 'style!css' },
            ]
          },
          resolve: {
            alias: aliases,
            extensions: ['', '.js', '.jsx'],
          },
        };

        compiler = webpack(webpackConfig);
        lfa.currentCompile.webpackCompiler = compiler; 
        if (lfa.currentCompile.watcher) { 
          lfa.currentCompile.watcher.webpackCompiler = compiler;
        }
      }

      compiler.run(function (err, st) {
        try {
          if (err) { throw err; }
          var stats = st.toJson({ errors: true, warnings: true });
          if (stats.errors.length) {
            throw stats.errors[0];
          }
          // Treat warnings as errors
          if (stats.warnings.length) {
            throw stats.warnings[0];
          }
          stream.end();
        } catch (err) {
          stream.emit('error', err);
        }
      });
    });

    return stream;
  });
};
