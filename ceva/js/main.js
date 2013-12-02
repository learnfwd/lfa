'use strict';

require.config({
  shim: {
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    backboneLocalstorage: {
      deps: ['backbone'],
      exports: 'Store'
    }
  },
  paths: {
    jquery: 'http://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min',
    templates: 'templates',
    underscore: 'underscore.min',
    backbone: 'backbone.min',
    backboneLocalstorage: 'backbone.localStorage.min'
  }
});

require([
  'backbone',
  'views/book',
  'routers/router'
], function(Backbone, BookView, Workspace) {
  console.log('JavaScript loaded.');
  
  window.App = {};
  
  App.BookView = new BookView();
  
  App.Router = new Workspace();
  Backbone.history.start();
});
