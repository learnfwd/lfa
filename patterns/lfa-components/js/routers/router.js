define([
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone) {
  'use strict';
  
  var Router = Backbone.Router.extend({
    routes: {
      '': 'home',
      'book/:chapter(/:id)': 'book'
    },
    
    home: function () {
      window.App.book.showFirstChapter();
    },
    
    book: function(chapter, id) {
      window.App.book.show(chapter, id);
    }
  });
  
  return Router;
});
