define(['backbone', 'bookview', 'router', 'translate'], function(Backbone, BookView, Router, T) {

  // Mixin wrapper
  window.getMixin = function (mix) {
    return function() {
      var old_buf = window.buf;
      var buf = window.buf = [];
      window.jade_mixins[mix].apply(null, arguments);
      window.buf = old_buf;
      return buf.join('');
    };
  };

  var App = window.App = new Backbone.Model();

  App.book = new BookView({ el: $('body') });
  App.router = new Router();
  App.T = T(); // Create a new translator instance

  return App;
});
