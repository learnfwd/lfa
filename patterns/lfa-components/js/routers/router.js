define([
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone) {
  'use strict';
  
  var Router = Backbone.Router.extend({
    routes: {
      '': 'home',
      'book/:chapter': 'book'
    },
    
    home: function () {
      App.book.showFirstChapter();
    },
    
    book: function(chapter) {
      App.book.show(chapter);
    }
  });
  
  return Router;
});