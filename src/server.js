var WebpackServer = require('webpack-dev-server');
var express = require('express');
var _ = require('lodash');
var processStats = require('./webpack-process-stats');

function Server(opts) {
  var self = this;
  var cache = opts.compileCache;
  var tmpPort = parseInt(opts.port, 10) + 1000;

  var wpOpts = {
    proxy: { '*': 'http://localhost:' + tmpPort },
    publicPath: '/',
    hot: opts.watcher.opts.hot,
    noInfo: !opts.watcher.opts.verbose,
    quiet: !opts.watcher.opts.verbose,
  };

  self.app = express();
  self.app.use(express.static(cache.buildPath));
  _.each(cache.assetPaths || [], function (path) {
    self.app.use(express.static(path));
  });
  self.tmpListening = false;
  self.listening = false;
  self.scheduledForClosing = false;

  self.app.listen(tmpPort, '127.0.0.1', function (err) {
    if (err) { throw err; }
    self.tmpListening = true;
    if (self.scheduledForClosing) {
      self.app.close();
    }

    cache.webpackCompiler.plugin('done', function (st) {
      var stats = st.toJson({ errors: true, warnings: true });
      stats = processStats(stats);
      _.each(stats.errors, function (err) {
        opts.watcher.emit('webpack-compile-error', err);
      });
      _.each(stats.warnings, function (err) {
        opts.watcher.emit('webpack-compile-warning', err);
      });
      opts.watcher.emit('webpack-compile-done');
    });

    cache.webpackCompiler.plugin('compile', function () {
      opts.watcher.emit('webpack-compiling');
    });

    self.devServer = new WebpackServer(cache.webpackCompiler, wpOpts);
    self.devServer._sendStats = function (socket, stats, force) {
      stats = processStats(stats);
      WebpackServer.prototype._sendStats(socket, stats, force);
    };
    self.devServer.close = function() {
      this.app.close();
      this.io.close();
    };
    self.devServer.listen(opts.port, function (err) {
      if (err) { throw err; }
      self.listening = true;
      if (self.scheduledForClosing) {
        self.app.close();
      }
      opts.watcher.emit('webpack-listening', opts.port);
    });
  });
}

Server.prototype.stop = function stop() {
  this.scheduledForClosing = true;
  if (this.devServer &&!this.listening) {
    this.devServer.close();
  }
  if (this.app &&!this.tmpListening) {
    this.app.close();
  }
};

module.exports = Server;
