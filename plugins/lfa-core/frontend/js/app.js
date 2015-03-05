var flux = require('flux');

var AppDispatcher = new flux.Dispatcher();
module.exports = AppDispatcher;

// These should go away
AppDispatcher.T = require('./translate');
AppDispatcher.storage = require('./storage');

// Deprecated old evented model
var Backbone = require('backbone');
_.extend(AppDispatcher, Backbone.Events);

function deprecated(original) {
  return function () {
    console.log('The evented App is being deprecated. Please switch to using flux Stores');
    original.apply(this, arguments);
  };
}

AppDispatcher.on = deprecated(AppDispatcher.on);
AppDispatcher.trigger = deprecated(AppDispatcher.trigger);

