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
    },
    hammer: {
      deps: ['jquery'],
      exports: 'Hammer'
    }
  },
  paths: {
    jquery: 'http://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min',
    templates: 'templates',
    underscore: 'underscore.min',
    backbone: 'backbone.min',
    backboneLocalstorage: 'backbone.localStorage.min',
    fastclick: '../lfa-components/lfa-js/lib/fastclick',
    hammer: 'jquery.hammer.min'
  }
});

require([
  'backbone',
  'views/book',
  'routers/router',
  'fastclick',
  'hammer'
], function(Backbone, BookView, Workspace, FastClick, Hammer) {
  console.log('JavaScript loaded.');
  FastClick.attach(document.body);
  
  window.App = {};
  
  App.BookView = new BookView();
  
  App.Router = new Workspace();
  Backbone.history.start();
  
  $('body').addClass('high-performance');
  
  $('#leftbar-toggle').click(function() {
    $('body').addClass('leftbar-active');
  });
  $('#rightbar-toggle').click(function() {
    $('body').addClass('rightbar-active');
  });
  
  $('#textbook').hammer().on('touch', function() {
    $('body').removeClass('leftbar-active');
    $('body').removeClass('rightbar-active');
  });
  $('body > nav').hammer().on('dragleft', function() {
    $('body').removeClass('leftbar-active');
  });
  $('body > aside').hammer().on('dragright', function() {
    $('body').removeClass('rightbar-active');
  });
  
  $('body > nav ul a').click(function() {
    $('body').removeClass('leftbar-active');
    $('body > nav ul li').removeClass('active');
    $(this).parent().addClass('active');
  });
  $('body > aside a').click(function() {
    $('body').removeClass('rightbar-active');
  });
  
  // Desktop classes to stop document scrolling while we're inside a sidebar.
  $('body > nav, body > aside').on('mouseover', function() {
    $('body').addClass('no-scroll');
  });
  $('body > nav, body > aside').on('mouseout', function() {
    $('body').removeClass('no-scroll');
  });
});
