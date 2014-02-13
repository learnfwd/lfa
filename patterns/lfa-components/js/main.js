require.config({
  paths: {
    // General purpose 3rd party libs.
    jquery:       'lib/jquery-2.0.3.min',
    underscore:   'lib/underscore.min',
    hammer:       'lib/jquery.hammer.min',
    modernizr:    'lib/modernizr.touch.min',
    fastclick:    'lib/fastclick',
    bootstrap:    'lib/bootstrap.min',
    nlform:       'lib/nl-form',
    stacktable:   'lib/stacktable',
    headroom:     'lib/headroom.min',
    
    // Backbone and accompanying libs.
    backbone:     'lib/backbone.min',
    store:        'lib/backbone.localStorage.min',
    queryengine:  'lib/backbone.queryEngine',
    
    // Backbone classes.
    bookview:     'views/book',
    router:       'routers/router',
    
    // LFA generated JSON objects.
    templates:    '../../js/templates/main',
    searchjson:   '../../js/searchjson'
  },
  shim: {
    jquery:       { exports: '$' },
    underscore:   { exports: '_' },
    hammer:       { exports: 'Hammer', deps: ['jquery'] },
    modernizr:    { exports: 'Modernizr' },
    fastclick:    { exports: 'FastClick' },
    bootstrap:    { exports: 'Bootstrap', deps: ['jquery'] },
    nlform:       { exports: 'NLForm' },
    stacktable:   { exports: 'Stacktable', deps: ['jquery'] },
    headroom:     { exports: 'Headroom' },
    
    backbone:     { exports: 'Backbone', deps: ['underscore', 'jquery'] },
    store:        { exports: 'Store', deps: ['backbone'] },
    queryengine:  { exports: 'QueryEngine', deps: ['backbone'] },
    
    templates:    { exports: 'Templates' },
    searchjson:   { exports: 'SearchJSON' },
    
    bookview:     { exports: 'BookView' },
    router:       { exports: 'Router' }
  }
});

require([
  'jquery',
  'backbone',
  'modernizr',
  
  'bookview',
  'router'
], function($, Backbone, Modernizr, BookView, Router) {
  'use strict';
  
  // Add some custom Modernizr tests.
  Modernizr.addTest('ipad', function () {
    return navigator.userAgent.match(/iPad/i);
  });
  
  Modernizr.addTest('iphone', function () {
    return navigator.userAgent.match(/iPhone/i);
  });
  
  Modernizr.addTest('ipod', function () {
    return navigator.userAgent.match(/iPod/i);
  });
  
  Modernizr.addTest('appleios', function () {
    return (Modernizr.ipad || Modernizr.ipod || Modernizr.iphone);
  });
  
  var App = window.App = {};
  App.book = new BookView({ el: $('body') });
  
  App.router = new Router();
  Backbone.history.start();
  
  var mainjs = null;
  
  require(['../../js/main'], function(foo) {
    mainjs = foo;
    if (typeof mainjs === 'function') { mainjs(); }
  });
  
  App.book.on('render', function() {
    // Execute textbook-specific javascript, if it exists, on every re-render.
    if (typeof mainjs === 'function') { mainjs(); }
  });
});

