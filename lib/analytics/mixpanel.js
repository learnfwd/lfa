var Mixpanel = require('mixpanel');

function MixpanelAnalytics() {
  this.mixpanel = Mixpanel.init('e7664e8400838d8c8f6dccca9302494f');
}

function _flatten(ob) {
  var toReturn = {};
  
  for (var i in ob) {
    if (!ob.hasOwnProperty(i)) {
      continue;
    }
    
    if ((typeof ob[i]) === 'object') {
      var flatObject = _flatten(ob[i]);
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) {
          continue;
        }
        toReturn[i + '.' + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
}

MixpanelAnalytics.prototype.trackEvent = function(manager, key, data) {
  var mixpanelEvent = _flatten({
    key: key,
    data: data,
    distinct_id: manager.clientId,
    version: manager.version,
  });
  this.mixpanel.track('cli-' + key, mixpanelEvent);
};

module.exports = MixpanelAnalytics;
