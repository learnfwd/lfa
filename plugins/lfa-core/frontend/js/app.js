define(['backbone', 'bookview', 'router', 'translate', 'searchjson', 'appStorage'], function(Backbone, BookView, Router, T, SearchJSON, Storage) {

  // Mixin wrapper
  window.getMixin = function (mix) {
    throw new Error('getMixin() is deprecated');
  };

  var App = window.App = new Backbone.Model();

  App.book = new BookView({ el: $('body') });
  App.router = new Router();
  App.T = T(); // Create a new translator instance
  App.T.language = SearchJSON.language || App.T.defaultLanguage;

  App.storage = Storage;
  
  return App;
});
