define(['backbone', 'bookview', 'router', 'translate', 'searchjson', 'appStorage'], function(Backbone, BookView, Router, T, SearchJSON, Storage) {

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
  App.T.language = SearchJSON.language || App.T.defaultLanguage;

  App.storage = Storage;
  
  return App;
});
