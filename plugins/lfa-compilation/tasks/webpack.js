var through = require('through2');
var path = require('path');
var webpack = require('webpack');
var _ = require('lodash');
var when = require('when');
var uuid = require('uuid');
var autoprefixer = require('autoprefixer');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');

var templatesJS = require('./js-templates');
var liveReloadJS = require('./js-live-reload');

var processStats = require('../../../src/webpack-process-stats');
var MergeFilesPlugin = require('./merge-files-plugin');

var browserList = ['Firefox >= 45', 'FirefoxAndroid >= 25', 'Chrome >= 49', 'ChromeAndroid >= 54', 'Android >= 4.03', 'iOS >= 7.1', 'Safari >= 7.0', 'Explorer >= 10', 'ExplorerMobile >= 10'];

function getConfig(lfa, bundledPlugins, aliases, name, publicPath) {
  var resolveFallback = [];
  var debug = !!lfa.currentCompile.debug;
  var dummyFile = path.resolve(__dirname, 'templates', 'foo.dummy');

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
  var mainEntrypoints = [];
  if (lfa.currentCompile.serve && lfa.currentCompile.watcher.opts.hot) {
    wpPlugins.push(new webpack.HotModuleReplacementPlugin());
    mainEntrypoints.push('webpack-dev-server/client?http://localhost:' + lfa.currentCompile.watcher.opts.port);
    mainEntrypoints.push('webpack/hot/dev-server');
  }

  // Make a prod or dev build of React
  wpPlugins.push(new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(debug ? 'development' : 'production'),
    '__DEV__': JSON.stringify(debug)
  }));

  // Add main entrypoints for JS and CSS
  mainEntrypoints.push('!!js-entrypoint-loader!' + dummyFile);
  mainEntrypoints.push('!!css-entrypoint-loader?type=main!' + dummyFile);
  mainEntrypoints.push('!!css-entrypoint-loader?type=vendor!' + dummyFile);

  // Merge the stub .js files generated for the CSS chunks with the main .js
  if (!debug) {
    wpPlugins.push(new MergeFilesPlugin({
      filename: name + '.js',
      test: new RegExp(name.replace(/([^a-zA-Z0-9])/g, "\\$1") + '(|-main|-vendor).js'),
    }));
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

  if (!debug) {
    wpPlugins.push(new MiniCssExtractPlugin());
  }
  var styleLoader = debug ? 'style-loader' : MiniCssExtractPlugin.loader;

  var babelConfig = {
    presets: [
      [require.resolve('@babel/preset-env'), {
        modules: false,
        targets: browserList,
      }],
      require.resolve('@babel/preset-react'),
      require.resolve('@babel/preset-flow'),
    ],
    plugins: []
  }

  if (!debug) {
    babelConfig.plugins.push([
      require.resolve('babel-plugin-transform-react-remove-prop-types'), {
        ignoreFilenames: ['node_modules']
      }
    ]);
  }

  // Configure Webpack
  var webpackConfig = {
    entry: {
      [name]: mainEntrypoints,
    },
    output: {
      path: lfa.currentCompile.buildPath,
      filename: '[name].js',
      library: 'bundle-' + uuid.v4(),
      libraryTarget: 'this',
      publicPath: publicPath,
    },
    externals: [externals],
    mode: debug ? 'development' : 'production',
    optimization: {
      // Separate CSS from JS entrypoints run in the same context. TODO: Do they if I output a library?
      splitChunks: {
        cacheGroups: {
          vendorStyles: {
            name: name + '-vendor',
            test: /(^|\/|\\)vendor\.(styl|sass|scss|css)/,
            chunks: 'all',
            enforce: true,
          },
          mainStyles: {
            name: name + '-main',
            test: /(^|\/|\\)(.(?!endor))*\.(styl|sass|scss|css)/,
            chunks: 'all',
            enforce: true,
          },
        },
      },
    },

    module: {
      rules: [
        { test: /\.jsx?$/,
          exclude: /(web|node)_modules/,
          use: { loader: 'babel-loader', options: babelConfig
        } },

        { test: /\.styl$/, exclude: /(^|\/|\\)(vendor|main)\.styl$/,
          use: [styleLoader, cssUrlLoader, postcssLoader, 'stylus-loader']
        },
        { test: /(^|\/|\\)(vendor|main)\.styl$/,
          use: [styleLoader, cssLoader, postcssLoader, 'stylus-loader']
        },

        { test: /\.scss$/, exclude: /(^|\/|\\)(vendor|main)\.scss$/,
          use: [styleLoader, cssUrlLoader, postcssLoader, 'sass-loader'],
        },
        { test: /(^|\/|\\)(vendor|main)\.scss$/,
          use: [styleLoader, cssLoader, postcssLoader, 'sass-loader'],
        },

        { test: /\.sass$/, exclude: /(^|\/|\\)(vendor|main)\.sass$/,
          use: [styleLoader, cssUrlLoader, postcssLoader, 'sass-loader?indentedSyntax']
        },
        { test: /(^|\/|\\)(vendor|main)\.sass$/,
          use: [styleLoader, cssLoader, postcssLoader, 'sass-loader?indentedSyntax']
        },

        { test: /\.css$/, exclude: /(^|\/|\\)(vendor|main)\.css$/,
          use: [styleLoader, cssUrlLoader, postcssLoader]
        },
        { test: /(^|\/|\\)(vendor|main)\.css$/,
          use: [styleLoader, cssLoader, postcssLoader]
        },


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
