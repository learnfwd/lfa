var _ = require('underscore');
var GoogleAnalytics = require('./ga');
var config = require('../global_config');
var uuid = require('node-uuid');
require('colors');

var ua = 'UA-44649809-3';
var warningMessage = [ 
  'Warning'.yellow,
  ': In order to continuously improve our products, ',
  'this software sends anonymous usage statistics. ',
  'If you wish to opt-out, alias ',
  'lfa'.yellow,
  ' to ',
  'lfa --no-analytics'.yellow
].join('');

function Analytics() {}
var AnalyticsProto = {};
var AnalyticsMock = {};
Analytics.prototype = AnalyticsMock;

AnalyticsMock.init = function init() {
  _.extend(AnalyticsMock, AnalyticsProto);

  var clientId = config.get().trackingUUID;
  if (!clientId) {
    clientId = uuid.v4();
    config.modify('trackingUUID', clientId);
    console.log(warningMessage);
  }

  this.ga = new GoogleAnalytics({
    cid: clientId,
    tid: ua,
  });
};

AnalyticsProto.trackVersion = function (version, cb) {
  this.ga.trackEvent('version', version, cb);
};

AnalyticsProto.trackCommand = function (cmd, cb) {
  this.ga.trackEvent('command', cmd, cb);
};

_.each(AnalyticsProto, function (v, k) {
  if (typeof(v) === 'function') {
    AnalyticsMock[k] = function () {};
  } else {
    AnalyticsMock[k] = v;
  }
});

module.exports = new Analytics();
