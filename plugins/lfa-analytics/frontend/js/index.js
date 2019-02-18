var App = require('lfa-core').App;
var Storage = require('lfa-core').Storage;
var BuildInfo = require('lfa-book').BuildInfo;
var UAParser = require('ua-parser-js');
var _ = require('lodash');

var MixpanelAnalytics = require('./mixpanel');
var GoogleAnalytics = require('./ga');
var IntercomAnalytics = require('./intercom');

function AnalyticsManager() {
  this.sessionId = _getSessionId();
  this.bookId = BuildInfo.bookId;
  this.title = document.title;
  this.userAgent = window.navigator.userAgent;
  this.userAgentParsed = new UAParser().getResult();
  this.debug = !!BuildInfo.debug;
  this.creatorId = BuildInfo.creatorTrackingId;

  this._backends = [];

  this._registerAnalyticsBackend(new MixpanelAnalytics(this));
  this._registerAnalyticsBackend(new GoogleAnalytics(this));
  this._registerAnalyticsBackend(new IntercomAnalytics(this));
}

AnalyticsManager.prototype._registerAnalyticsBackend = function(be) {
  this._backends.push(be);
};

function _makeUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r&0x3 | 0x8);
    return v.toString(16);
  });
}

function _getSessionId() {
  var key = 'trackingSessionId';
  var sessionId = Storage.getItem(key, { global: true });
  if (!sessionId) {
    sessionId = _makeUUID();
    Storage.setItem(key, sessionId, { global: true });
  }
  return sessionId;
}

AnalyticsManager.prototype.trackEvent = function (key, data) {
  var self = this;
  _.each(self._backends, function (backend) {
    backend.trackEvent(self, key, data);
  });
};

var analyticsManager = new AnalyticsManager();

App.on('static', function (key, data) {
  analyticsManager.trackEvent(key, data);
});

App.book.on('render', function (opts) {
  analyticsManager.trackEvent('navigate', { route: opts.chapter });
});

module.exports = analyticsManager;
