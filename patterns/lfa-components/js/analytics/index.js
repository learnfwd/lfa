define(['app', 'searchjson', 'ua-parser', 'underscore', './keen', './mixpanel', './static', './ga'], function(App, SearchJSON, UAParser, _, KeenAnalytics, MixpanelAnalytics, StaticAnalytics, GoogleAnalytics) {

  function AnalyticsManager() {
    this.sessionId = _getSessionId();
    this.bookId = SearchJSON.bookId;
    this.title = document.title;
    this.userAgent = window.navigator.userAgent;
    this.userAgentParsed = new UAParser().getResult();
    this.debug = !!SearchJSON.debug;

    this._backends = [];

    this._registerAnalyticsBackend(new KeenAnalytics(this));
    this._registerAnalyticsBackend(new MixpanelAnalytics(this));
    this._registerAnalyticsBackend(new StaticAnalytics(this));
    this._registerAnalyticsBackend(new GoogleAnalytics(this));
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
    var sessionId = App.storage.getItem(key, { global: true });
    if (!sessionId) {
      sessionId = _makeUUID();
      App.storage.setItem(key, sessionId, { global: true });
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

  window.App.on('static', function (key, data) {
    analyticsManager.trackEvent(key, data);
  });

  window.App.book.on('render', function (opts) {
    analyticsManager.trackEvent('navigate', { route: opts.chapter });
  });

  return analyticsManager;
});
