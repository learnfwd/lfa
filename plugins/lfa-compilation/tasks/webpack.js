var through = require('through2');
var path = require('path');
var webpack = require('webpack');
var _ = require('lodash');
var when = require('when');
var uuid = require('uuid');
var autoprefixer = require('autoprefixer');

var templatesJS = require('./js-templates');
var liveReloadJS = require('./js-live-reload');

var CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var processStats = require('../../../src/webpack-process-stats');

var browserList = ['Firefox >= 25', 'FirefoxAndroid >= 25', 'Chrome >= 31', 'ChromeAndroid >= 31', 'Android >= 4.03', 'iOS >= 7.1', 'Safari >= 7.0', 'Explorer >= 10', 'ExplorerMobile >= 10'];

function getConfig(lfa, bundledPlugins, aliases, name, publicPath) {
  var resolveFallback = [];
  var debug = !!lfa.currentCompile.debug;
  var dummyFile = path.resolve(__dirname, 'templates', 'foo.dummy');

  // Misc library aliases
  aliases.underscore = 'lodash';

  // Plugin JS aliases. $ assures an exact match (no lfa-core/app)
  _.each(bundledPlugins, function (plugin) {
    if (plugin.package.lfa.hasJS === false) { return; }
    aliases[plugin.name + '$'] = path.join(plugin.path, 'frontend', 'js');
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

  // Fetch potential externals from plugins
  var providedDeps = [];
  var deps = [];
  _.each(bundledPlugins, function (plugin) {
    providedDeps.push(plugin.name);
    if (!plugin.package.lfa) { return; }
    try {
      _.each(plugin.package.lfa.providedDependencies, function (dep) {
        providedDeps.push(dep);
      });
    } catch (ex) {}
    try {
      _.each(plugin.package.lfa.dependencies, function (dep) {
        deps.push(dep);
      });
    } catch (ex) {}
  });

  // Calculate externals
  var externals = {};
  _(deps).filter(function (dep) {
    return !_.contains(providedDeps, dep);
  }).each(function (external) {
    externals[external] = 'commonjs ' + external;
  });

  // Hot reload
  var wpPlugins = [];
  var mainEntrypoints = [];
  if (lfa.currentCompile.serve && lfa.currentCompile.watcher.opts.hot) {
    wpPlugins.push(new webpack.HotModuleReplacementPlugin());
    mainEntrypoints.push('webpack/hot/dev-server');
  }

  // Minify JS in production
  if (!debug) {
    wpPlugins.push(new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      }
    }));
  }

  // Separate CSS from JS entrypoints run in the same context. TODO: Do they if I output a library?
  if (debug) {
    wpPlugins.push(new CommonsChunkPlugin(name + '-commons.js', [name, name + '-css-main', name + '-css-vendor']));
  }

  var mainExtractPlugin = new ExtractTextPlugin(name + '-main.css', { allChunks: true, disable: debug });
  var vendorExtractPlugin = new ExtractTextPlugin(name + '-vendor.css', { allChunks: true, disable: debug });
  wpPlugins.push(mainExtractPlugin);
  wpPlugins.push(vendorExtractPlugin);

  mainEntrypoints.push('!!js-entrypoint-loader!' + dummyFile);

  var wpEntries = {};
  wpEntries[name] = mainEntrypoints;

  var cssMainEntrypoint = '!!' + mainExtractPlugin.extract('css-entrypoint-loader?type=main') + '!' + dummyFile;
  var cssVendorEntrypoint = '!!' + vendorExtractPlugin.extract('css-entrypoint-loader?type=vendor') + '!' + dummyFile;

  if (debug) {
    wpEntries[name + '-css-main'] = cssMainEntrypoint;
    wpEntries[name + '-css-vendor'] = cssVendorEntrypoint;
  } else {
    // This has the side effect of not emmiting useless -css-*.js files
    mainEntrypoints.push(cssMainEntrypoint);
    mainEntrypoints.push(cssVendorEntrypoint);
  }

  var webpackConfig = {
    entry: wpEntries,
    output: {
      path: lfa.currentCompile.buildPath,
      filename: '[name].js',
      library: 'bundle-' + uuid.v4(),
      libraryTarget: 'this',
      publicPath: publicPath,
    },
    externals: [externals],
    debug: debug,
    devtool: debug ? 'eval-source-map' : null,
    module: {
      loaders: [
        { test: /\.jsx$/, loaders: ['react-hot', 'jsx?harmony'] },
        { test: /\.json$/, loaders: ['json-loader'] },

        { test: /\.styl$/, loader: mainExtractPlugin.extract('style-loader', 'css-loader' + (debug ? '' : '!css-minify') + '!postcss-loader!stylus-loader') },
        { test: /\.scss$/, loader: mainExtractPlugin.extract('style-loader', 'css-loader' + (debug ? '' : '!css-minify') + '!postcss-loader!sass-loader') },
        { test: /\.sass$/, loader: mainExtractPlugin.extract('style-loader', 'css-loader' + (debug ? '' : '!css-minify') + '!postcss-loader!sass-loader?indentedSyntax') },
        { test: /\.css$/, loader: mainExtractPlugin.extract('style-loader', 'css-loader' + (debug ? '' : '!css-minify') + '!postcss-loader') },

        { test: /\.(png|jpe?g|gif|ogg|mp3|m4a|m4v|mov|webm|ogv|woff|otf|ttf)(\?[^\?]+)?$/, loaders: ['file-loader'] },
      ]
    },
    resolve: {
      alias: aliases,
      extensions: ['', '.js', '.jsx', '.json'],
      fallback: resolveFallback,
    },
    resolveLoader: {
      fallback: resolveFallback,
    },
    lfaPlugins: bundledPlugins,
    dummyFile: dummyFile,
    plugins: wpPlugins,
    postcss: [ autoprefixer({ browsers: browserList }) ],
    lfa: lfa,
  };

  return webpackConfig;
}

function compileBundle(lfa) {
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
          stats = processStats(stats);

          if (stats.errors.length) {
            throw stats.errors[0];
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
      compileBundle(lfa, lfa.plugins, aliases, lfa.currentCompile.bundleName || 'book', lfa.currentCompile.publicPath)
        .then(function () {
          stream.end();
        })
        .catch(function (err) {
          stream.emit('error', err);
        });
    });


    return stream;
  });
};
