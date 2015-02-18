var _ = require('underscore');
var config = require('../global_config');
var uuid = require('node-uuid');
require('colors');

var GoogleAnalytics = require('./google-analytics');
var MixpanelAnalytics = require('./mixpanel');
var KeenAnalytics = require('./keen');

function Analytics() {}
var AnalyticsProto = {};
var AnalyticsMock = {};
Analytics.prototype = AnalyticsMock;

AnalyticsMock.init = function init(opts) {
  _.extend(AnalyticsMock, AnalyticsProto);

  opts = opts || {};
  var clientId = opts.clientId || config.get().trackingUUID;
  if (!clientId) {
    clientId = uuid.v4();
    config.modify('trackingUUID', clientId);
  }

  this.clientId = clientId;
  this.version = opts.version;

  this._backends = [];
  this._registerAnalyticsBackend(new GoogleAnalytics(this));
  this._registerAnalyticsBackend(new MixpanelAnalytics(this));
  this._registerAnalyticsBackend(new KeenAnalytics(this));
};

AnalyticsProto._registerAnalyticsBackend = function(be) {
  this._backends.push(be);
};

AnalyticsProto.trackEvent = function (key, data) {
  var self = this;
  _.each(self._backends, function (backend) {
    backend.trackEvent(self, key, data);
  });
};

AnalyticsProto.trackCommand = function (cmd) {
  this.trackEvent('command', { action: cmd });
};

_.each(AnalyticsProto, function (v, k) {
  if (typeof(v) === 'function') {
    AnalyticsMock[k] = function () {};
  } else {
    AnalyticsMock[k] = v;
  }
});

module.exports = new Analytics();
