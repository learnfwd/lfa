define(['backbone', 'bookview', 'router'], function(Backbone, BookView, Router) {

  // Mixin wrapper
  window.getMixin = function (mix) {
    return function() {
      var old_buf = window.buf;
      var buf = window.buf = [];
      window.jade_mixins[mix].apply(null, arguments);
      window.buf = old_buf;
      return buf.join("");
    }
  }

  var App = window.App = new Backbone.Model();

  App.book = new BookView({ el: $('body') });
  App.router = new Router();

  return App;
});
