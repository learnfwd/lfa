'use strict';

define([
  'jquery',
  'backbone'
], function($, Backbone) {
  var Workspace = Backbone.Router.extend({
    routes: {
      '': 'home',
      'book/:chapter': 'book'
    },
    
    home: function () {
      console.log("Welcome home.");
    },
    
    book: function(chapter) {
      App.BookView.render(chapter);
    }
  });
  
  return Workspace;
});