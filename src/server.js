var WebpackServer = require('webpack-dev-server');
var express = require('express');
var _ = require('lodash');

function Server(opts) {
  var self = this;
  var cache = opts.compileCache;
  var tmpPort = opts.port + 1000;

  var wpOpts = {
    proxy: { '*': 'http://localhost:' + tmpPort },
    publicPath: '/',
    hot: opts.watcher.opts.hot,
    noInfo: true,
    quiet: true,
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

    self.devServer = new WebpackServer(cache.webpackCompiler, wpOpts);
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
      opts.watcher.emit('listening', opts.port);
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
