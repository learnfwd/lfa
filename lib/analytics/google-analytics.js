var _ = require('underscore');
var GA = require('./ga');

var gaTrackingId = 'UA-44649809-3';
function GoogleAnalytics(manager) {
  this.ga = new GA({
    cid: manager.clientId,
    tid: gaTrackingId,
  });

  this.trackEvent(manager, 'version', { action: manager.version });
}

GoogleAnalytics.prototype.trackEvent = function(manager, key, data) {
  var d = _.clone(data || {});
  var action = d.action || 'default';
  delete d.action;
  d.version = manager.version;
  this.ga.trackEvent(key, action, JSON.stringify(d));
};

module.exports = GoogleAnalytics;
