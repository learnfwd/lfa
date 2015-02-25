define(['backbone', 'bookview', 'router', 'translate', 'searchjson', 'appStorage', 'templates'], function(Backbone, BookView, Router, T, SearchJSON, Storage, templates) {

  // Mixin wrapper
  window.getMixin = function (mix) {
    console.log('getMixin() is deprecated, please use require(\'templates\')');
    return templates.mixins[mix];
  };

  var App = window.App = new Backbone.Model();

  App.book = new BookView({ el: $('body') });
  App.router = new Router();
  App.T = T(); // Create a new translator instance
  App.T.language = SearchJSON.language || App.T.defaultLanguage;

  App.storage = Storage;
  
  return App;
});
