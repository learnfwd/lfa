var listeners = [];

function register(cb) {
  listeners.push(cb);
}

module.exports = {
  register: register
};

var _ = require('lodash');
var textVersions = require('text-versions');

if (module.hot) {
  module.hot.accept('text-versions', function () {
    var newTextVersions = require('text-versions');
    _.each(newTextVersions, function (val, key) {
      if (textVersions[key] !== val) {
        _.each(listeners, function (cb) {
          cb(key);
        });
      }
    });

    textVersions = newTextVersions;
  });
}
