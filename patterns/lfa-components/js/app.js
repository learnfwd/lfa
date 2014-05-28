define(['backbone', 'bookview', 'router'], function(Backbone, BookView, Router) {
  var App = window.App = new Backbone.Model();

  App.book = new BookView({ el: $('body') });
  App.router = new Router();

  return App;
});
