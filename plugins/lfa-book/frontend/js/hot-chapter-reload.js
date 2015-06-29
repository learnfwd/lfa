var _ = require('lodash');
var textVersions = require('text-versions');

var listeners = [];

function register(cb, target) {
  listeners.push({ cb: cb, target: target });
}

function deregister(cb, target) {
  listeners = _.filter(listeners, function (listener) {
    if (cb && cb === listener.cb) {
      return false;
    }
    if (target && target === listener.target) {
      return false;
    }
    return true;
  });
}

module.exports = {
  register: register,
  deregister: deregister,
};

if (module.hot) {
  module.hot.accept('text-versions', function () {
    var newTextVersions = require('text-versions');
    _.each(newTextVersions, function (val, key) {
      if (textVersions[key] !== val) {
        _.each(listeners, function (listener) {
          listener.cb.call(listener.target, key);
        });
      }
    });

    textVersions = newTextVersions;
  });
}
