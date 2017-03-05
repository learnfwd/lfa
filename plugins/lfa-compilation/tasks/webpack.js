var through = require('through2');
var path = require('path');
var webpack = require('webpack');
var _ = require('lodash');
var when = require('when');
var uuid = require('uuid');
var autoprefixer = require('autoprefixer');

var templatesJS = require('./js-templates');
var liveReloadJS = require('./js-live-reload');

var ExtractTextPlugin = require('extract-text-webpack-plugin');

var processStats = require('../../../src/webpack-process-stats');

var browserList = ['Firefox >= 25', 'FirefoxAndroid >= 25', 'Chrome >= 31', 'ChromeAndroid >= 31', 'Android >= 4.03', 'iOS >= 7.1', 'Safari >= 7.0', 'Explorer >= 10', 'ExplorerMobile >= 10'];

function getConfig(lfa, bundledPlugins, aliases, name, publicPath) {
  var resolveFallback = [];
  var debug = !!lfa.currentCompile.debug;
  var dummyFile = path.resolve(__dirname, 'templates', 'foo1.dummy');

  // Misc library aliases
  aliases.underscore = 'lodash';
  aliases.fs = path.resolve(__dirname, '..', 'web_modules', 'mock-fs.js')

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
  resolveFallback.push('node_modules')

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
    return !_.includes(providedDeps, dep);
  }).each(function (external) {
    externals[external] = 'commonjs ' + external;
  });

  // Hot reload
  var wpPlugins = [];
  var mainEntrypoints = ['babel-polyfill'];
  if (lfa.currentCompile.serve && lfa.currentCompile.watcher.opts.hot) {
    wpPlugins.push(new webpack.HotModuleReplacementPlugin());
    mainEntrypoints.push('react-hot-loader/patch');
    mainEntrypoints.push('webpack-dev-server/client?http://localhost:' + lfa.currentCompile.watcher.opts.port);
    mainEntrypoints.push('webpack/hot/dev-server');
  }

  // Make a prod or dev build of React
  wpPlugins.push(new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(debug ? 'development' : 'production'),
    '__DEV__': JSON.stringify(debug)
  }));

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
    wpPlugins.push(new webpack.optimize.CommonsChunkPlugin({
      name: name + '-commons',
      filename: name + '-commons.js',
      chunks: [name, name + '-css-main', name + '-css-vendor']
    }));
  }

  // Extract CSS separately in the production build
  var mainExtractPlugin = new ExtractTextPlugin({
    filename: name + '-main.css',
    allChunks: true,
    disable: debug
  });
  var vendorExtractPlugin = new ExtractTextPlugin({
    filename: name + '-vendor.css',
    allChunks: true,
    disable: debug
  });

  wpPlugins.push(mainExtractPlugin);
  wpPlugins.push(vendorExtractPlugin);

  // Add main entrypoints for JS and CSS
  mainEntrypoints.push('!!js-entrypoint-loader!' + dummyFile);

  var wpEntries = {};
  wpEntries[name] = mainEntrypoints;

  var cssMainEntrypoint = '!!css-entrypoint-loader?type=main!' + dummyFile;
  var cssVendorEntrypoint = '!!css-entrypoint-loader?type=vendor!' + dummyFile;

  if (debug) {
    wpEntries[name + '-css-main'] = cssMainEntrypoint;
    wpEntries[name + '-css-vendor'] = cssVendorEntrypoint;
  } else {
    // This has the side effect of not emmiting useless -css-*.js files
    mainEntrypoints.push(cssMainEntrypoint);
    mainEntrypoints.push(cssVendorEntrypoint);
  }

  // Configure various loaders
  var postcssLoader = {
    loader: 'postcss-loader',
    options: {
      plugins: function () {
        var postcssPlugins = [autoprefixer({ browsers: browserList })]
        if (!debug) {
          postcssPlugins.push(require('cssnano'))
        }
        return postcssPlugins
      }
    }
  };

  var cssLoader = {
    loader: 'css-loader',
    options: {
      url: false,
      import: false
    }
  };

  var cssUrlLoader = 'css-loader';

  var babelConfig = {
    presets: [
      [require.resolve('babel-preset-latest'), { es2015: { modules: false } }],
      require.resolve('babel-preset-react')
    ],
    plugins: []
  }

  if (debug) {
    babelConfig.plugins.push(require.resolve('react-hot-loader/babel'))
  } else {
    babelConfig.plugins.push([
      require.resolve('babel-plugin-transform-react-remove-prop-types'), {
        ignoreFilenames: ['node_modules']
      }
    ]);
  }

  // Configure Webpack
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
    devtool: debug ? 'eval-source-map' : false,
    module: {
      rules: [
        { test: /\.jsx?$/,
          exclude: /(web|node)_modules/,
          use: { loader: 'babel-loader', options: babelConfig
        } },
        { test: /\.json$/, use: ['json-loader'] },


        { test: /\.styl$/, exclude: /(^|\/)(vendor|main)\.styl$/, use: mainExtractPlugin.extract({
          fallback: 'style-loader',
          use: [cssUrlLoader, postcssLoader, 'stylus-loader']
        }) },
        { test: /(^|\/)main\.styl$/, use: mainExtractPlugin.extract({
          fallback: 'style-loader',
          use: [cssLoader, postcssLoader, 'stylus-loader']
        }) },
        { test: /(^|\/)vendor\.styl$/, use: vendorExtractPlugin.extract({
          fallback: 'style-loader',
          use: [cssLoader, postcssLoader, 'stylus-loader']
        }) },

        { test: /\.scss$/, exclude: /(^|\/)(vendor|main)\.scss$/, use: mainExtractPlugin.extract({
          fallback: 'style-loader',
          use: [cssUrlLoader, postcssLoader, 'sass-loader']
        }) },
        { test: /(^|\/)main\.scss$/, use: mainExtractPlugin.extract({
          fallback: 'style-loader',
          use: [cssLoader, postcssLoader, 'sass-loader']
        }) },
        { test: /(^|\/)vendor\.scss$/, use: vendorExtractPlugin.extract({
          fallback: 'style-loader',
          use: [cssLoader, postcssLoader, 'sass-loader']
        }) },

        { test: /\.sass$/, exclude: /(^|\/)(vendor|main)\.sass$/, use: mainExtractPlugin.extract({
          fallback: 'style-loader',
          use: [cssUrlLoader, postcssLoader, 'sass-loader?indentedSyntax']
        }) },
        { test: /(^|\/)main\.sass$/, use: mainExtractPlugin.extract({
          fallback: 'style-loader',
          use: [cssLoader, postcssLoader, 'sass-loader?indentedSyntax']
        }) },
        { test: /(^|\/)vendor\.sass$/, use: vendorExtractPlugin.extract({
          fallback: 'style-loader',
          use: [cssLoader, postcssLoader, 'sass-loader?indentedSyntax']
        }) },

        { test: /\.css$/, exclude: /(^|\/)(vendor|main)\.css$/, use: mainExtractPlugin.extract({
          fallback: 'style-loader',
          use: [cssUrlLoader, postcssLoader]
        }) },
        { test: /(^|\/)main\.css$/, use: mainExtractPlugin.extract({
          fallback: 'style-loader',
          use: [cssLoader, postcssLoader]
        }) },
        { test: /(^|\/)vendor\.css$/, use: vendorExtractPlugin.extract({
          fallback: 'style-loader',
          use: [cssLoader, postcssLoader]
        }) },


        { test: /\.(png|jpe?g|gif|ogg|mp3|m4a|m4v|mov|webm|ogv|woff|otf|ttf)(\?[^\?]+)?$/,
          use: ['file-loader']
        },
      ]
    },
    resolve: {
      alias: aliases,
      extensions: ['*', '.js', '.jsx', '.json'],
      modules: resolveFallback,
    },
    resolveLoader: {
      modules: resolveFallback,
    },
    plugins: wpPlugins,
  };

  wpPlugins.push(new webpack.LoaderOptionsPlugin({
    options: {
      lfaPlugins: bundledPlugins,
      dummyFile: dummyFile,
      lfa: lfa,
      debug: debug,
    }
  }));

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
            console.log(stats.errors)
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
      .pipe(lfa.hook('tmp-post-write:*')); });

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
