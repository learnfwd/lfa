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
    backboneLocalstorage: 'backbone.localStorage.min',
    fastclick: '../lfa-components/lfa-js/lib/fastclick'
  }
});

require([
  'backbone',
  'views/book',
  'routers/router',
  'fastclick'
], function(Backbone, BookView, Workspace, FastClick) {
  console.log('JavaScript loaded.');
  FastClick.attach(document.body);
  
  window.App = {};
  
  App.BookView = new BookView();
  
  App.Router = new Workspace();
  Backbone.history.start();
  
  $('#detail-toggle').click(function(e) {
    $('body').toggleClass('high-detail');
  });
  
  $('#leftbar-toggle').click(function(e) {
    $('body').toggleClass('leftbar-active');
  });
  $('#rightbar-toggle').click(function(e) {
    $('body').toggleClass('rightbar-active');
  });
  $('#textbook').click(function(e) {
    $('body').removeClass('leftbar-active');
    $('body').removeClass('rightbar-active');
  });
});
