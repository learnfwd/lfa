var _ = require('underscore');
var ga = require('ga');
var config = require('./global_config');
var uuid = require('node-uuid');
require('colors');

var ua = 'UA-44649809-3';
var host = 'lfa.learnfwd.com';
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
  Analytics.prototype = AnalyticsProto;
  this.ga = new ga(ua, host);

  this.userId = config.get().trackingUUID;
  if (!this.userId) {
    this.userId = uuid.v4();
    config.modify('trackingUUID', this.userId);
    console.log(warningMessage);
  }
};

AnalyticsProto.trackVersion = function (version) {
  this.ga.trackPage(version, this.userId);
};

AnalyticsProto.trackCommand = function (cmd) {
  this.ga.trackEvent({ 
    category: 'command',
    action: cmd
  }, this.userId);
};


_.each(AnalyticsProto, function (v, k) {
  if (typeof(v) === 'function') {
    AnalyticsMock[k] = function () {};
  } else {
    AnalyticsMock[k] = v;
  }
});

module.exports = new Analytics();
