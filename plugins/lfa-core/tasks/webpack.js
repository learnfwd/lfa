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

    deps.on('end', function () {
      var compiler = (lfa.previousCompile && lfa.previousCompile.webpackCompiler) ||
                     (lfa.currentCompile.watcher && lfa.currentCompile.watcher.webpackCompiler);

      if (!compiler) {

        var aliases = { 'userland': path.join(lfa.config.projectPath, 'js') };
        _.each(lfa.plugins, function (plugin) {
          aliases[plugin.name] = path.join(plugin.path, 'frontend', 'js');
        });

        var webpackConfig = {
          entry: {
            main: path.join(lfa.config.tmpPath, 'gen', 'index.js'),
          },
          output: {
            path: lfa.currentCompile.buildPath,
            filename: 'index.js',
          },
          devtool: lfa.currentCompile.debug ? '#source-map' : null,
          module: {
            loaders: [
              { test: /\.jsx$/, loader: 'jsx' },
              { test: /\.json$/, loader: 'json' },
              { test: /\.styl$/, loader: 'style!css!stylus' },
              { test: /\.css$/, loader: 'style!css' },
            ]
          },
          resolve: {
            alias: aliases,
            extensions: ['', '.js', '.jsx', '.json'],
          },
        };

        compiler = webpack(webpackConfig);
        lfa.currentCompile.webpackCompiler = compiler; 
        if (lfa.currentCompile.watcher) { 
          lfa.currentCompile.watcher.webpackCompiler = compiler;
        }
      }

      compiler.compile(function (err, stats) {
        try {
          if (err) { throw err; }
          if (stats.errors.length) {
            throw stats.errors[0];
          }
          stream.end();
        } catch (err) {
          stream.emit('error', err);
        }
      });
    });

    deps.resume();
    return stream;
  });
};
