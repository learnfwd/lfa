var LFACore = {
  AppDispatcher: require('./app'),
  Storage: require('./storage'),
  Translate: require('./translate'),
};

LFACore.App = LFACore.AppDispatcher;
LFACore.T = LFACore.Translate;

module.exports = LFACore;

// Bootstrap our app
var MainView = require('./views/main-view');
new MainView();
