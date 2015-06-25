var through = require('through2');
var path = require('path');
var webpack = require('webpack');
var _ = require('lodash');
var when = require('when');
var autoprefixer = require('autoprefixer-stylus');

var templatesJS = require('./js-templates');
var liveReloadJS = require('./js-live-reload');

var CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

function getConfig(lfa, bundledPlugins, aliases, name, publicPath) {
  var resolveFallback = [];
  var debug = !!lfa.currentCompile.debug;

  // Misc library aliases
  aliases.underscore = 'lodash';

  // Plugin JS aliases
  // TODO: remove these
  _.each(bundledPlugins, function (plugin) {
    aliases[plugin.name] = path.join(plugin.path, 'frontend', 'js');
    resolveFallback.push(path.join(plugin.path, 'web_modules'));
  });

  // Non-standard library paths
  _.each(lfa.plugins, function (plugin) {
    resolveFallback.push(path.join(plugin.path, 'web_modules'));
  });
  resolveFallback.push(path.join(lfa.path, 'web_modules'));
  resolveFallback.push(path.join(lfa.path, 'node_modules'));
  _.each(lfa.plugins, function (plugin) {
    resolveFallback.push(path.join(plugin.path, 'node_modules'));
  });

  // Hot reload
  var wpPlugins = [];
  var mainEntrypoints = [];
  if (lfa.currentCompile.serve && lfa.currentCompile.watcher.opts.hot) {
    wpPlugins.push(new webpack.HotModuleReplacementPlugin());
    mainEntrypoints.push('webpack/hot/dev-server');
  }

  // Separate CSS from JS entrypoints run in the same context. TODO: Do they if I output a library?
  if (debug) {
    wpPlugins.push(new CommonsChunkPlugin(name + '-commons.js', [name + '-js', name + '-css-user', name + '-css-vendor']));
  }

  var userExtractPlugin = new ExtractTextPlugin(name + '-user.css', { allChunks: true, disable: debug });
  var vendorExtractPlugin = new ExtractTextPlugin(name + '-vendor.css', { allChunks: true, disable: debug });
  wpPlugins.push(userExtractPlugin);
  wpPlugins.push(vendorExtractPlugin);

  var dummyFile = path.resolve(__dirname, 'templates', 'foo.dummy');
  mainEntrypoints.push('!!entrypoint-loader?type=js!' + dummyFile);

  var wpEntries = {};
  wpEntries[name + '-js'] = mainEntrypoints;
  wpEntries[name + '-css-user'] = '!!' + userExtractPlugin.extract('entrypoint-loader?type=css-user') + '!' + dummyFile;
  wpEntries[name + '-css-vendor'] = '!!' + userExtractPlugin.extract('entrypoint-loader?type=css-vendor') + '!' + dummyFile;

  var webpackConfig = {
    entry: wpEntries,
    output: {
      path: lfa.currentCompile.buildPath,
      filename: '[name].js',
    },
    debug: debug,
    devtool: debug ? 'eval-source-map' : null,
    publicPath: publicPath,
    module: {
      loaders: [
        { test: /\.jsx$/, loaders: ['react-hot', 'jsx?harmony'] },
        { test: /\.json$/, loaders: ['json-loader'] },

        { test: /\.styl$/, loader: userExtractPlugin.extract('style-loader', 'css-loader' + (debug ? '' : '!css-minify') + '!stylus-loader') },
        { test: /\.css$/, loader: userExtractPlugin.extract('style-loader', 'css-loader' + (debug ? '' : '!css-minify')) },

        { test: /\.(png|jpe?g|gif|ogg|mp3|m4a|m4v|mov|webm|ogv|woff|otf|ttf)(\?[^\?]+)?$/, loaders: ['file-loader'] },
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
    lfaPlugins: bundledPlugins,
    dummyFile: dummyFile,
    plugins: wpPlugins,
    stylus: { use: [autoprefixer()] },
    lfa: lfa,
  };

  return webpackConfig;
}

function compilePlugin(lfa) {
  var args = arguments;
  return when.try(function () {
    var compiler = lfa.currentCompile.debug && ((lfa.previousCompile && lfa.previousCompile.webpackCompiler) ||
                   (lfa.currentCompile.watcher && lfa.currentCompile.watcher.webpackCompiler));
    if (compiler) { return compiler; }

    return when(getConfig.apply(null, args)).then(function (webpackConfig) {
      return webpack(webpackConfig);
    });

  }).then(function (compiler) {
    lfa.currentCompile.webpackCompiler = compiler; 
    if (lfa.currentCompile.watcher) { 
      lfa.currentCompile.watcher.webpackCompiler = compiler;
    }

    if (lfa.currentCompile.serve) {
      return;
    }

    return when.promise(function (resolve, reject) {
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

          _.each(stats.warnings || [], function (warning) {
            lfa.logWarning(warning);
          });

          resolve();
        } catch (ex) {
          reject(ex);
        }
      });
    });
  });
}

module.exports = function webpackTasks(lfa) {
  templatesJS(lfa);
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
      var action;

      if (lfa.currentCompile.debug) {
        // Compile all plugins in the same bundle in debug mode
        action = compilePlugin(lfa, lfa.plugins, aliases, 'combined');
      } else {
        // And separate them in release mode
        action = when.all(_.map(lfa.plugins, function (plugin) {
          compilePlugin(lfa, [plugin], aliases, plugin.name);
        }));
      }

      action.then(function () {
        stream.end();
      }).catch(function (err) {
        stream.emit('error', err);
      });
    });


    return stream;
  });
};
