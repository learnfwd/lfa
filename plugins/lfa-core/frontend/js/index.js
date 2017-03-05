require('babel-polyfill');

var LFACore = {
  AppDispatcher: require('./app'),
  Storage: require('./storage'),
  Translate: require('./translate'),

  // Private exports
  _TocView: require('./views/toc'),
};

LFACore.App = LFACore.AppDispatcher;
LFACore.T = LFACore.Translate;

module.exports = LFACore;

// Bootstrap our app
var MainView = require('./views/main-view');
new MainView();
