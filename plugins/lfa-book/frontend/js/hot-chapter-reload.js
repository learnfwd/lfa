var textVersions = require('text-versions');

var listeners = [];

function filter(arr, pred) {
  var r = [];
  for (var i = 0, n = arr.length; i < n; i++) {
    if (pred(arr[i], i)) {
      r.push(arr[i]);
    }
  }
  return r;
}

function register(cb, target) {
  listeners.push({ cb: cb, target: target });
}

function deregister(cb, target) {
  listeners = filter(listeners, function (listener) {
    if (cb && target) {
      return !(cb === listener.cb && target === listener.target);
    }
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
    for (var key in newTextVersions) {
      if (textVersions[key] !== newTextVersions[key]) {
        listeners.forEach(function (listener) {
          listener.cb.call(listener.target, key);
        });
      }
    }

    textVersions = newTextVersions;
  });
}
