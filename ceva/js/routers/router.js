'use strict';

define([
  'jQuery',
  'Backbone'
], function($, Backbone) {
  var Router = Backbone.Router.extend({
    routes: {
      '': 'home',
      'book/:chapter': 'book'
    },
    
    home: function () {
    },
    
    book: function(chapter) {
      App.BookView.render(chapter);
    }
  });
  
  return Router;
});