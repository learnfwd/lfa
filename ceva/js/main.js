'use strict';

require.config({
  paths: {
    // General purpose 3rd party libs.
    jquery:       '../lfa-components/lfa-js/lib/jquery-2.0.3.min',
    underscore:   'underscore.min',
    hammer:       'jquery.hammer.min',
    modernizr:    '../lfa-components/lfa-js/lib/modernizr.touch.min',
    fastclick:    '../lfa-components/lfa-js/lib/fastclick',
    
    // LFA generated JSON objects.
    templates:    'templates',
    searchjson:   'searchjson',
    
    // Backbone and accompanying libs.
    backbone:     'backbone.min',
    store:        'backbone.localStorage.min',
    queryengine:  'backbone.queryEngine',
    
    // Backbone classes.
    bookview:     'views/book',
    router:       'routers/router'
  },
  shim: {
    jquery:       { exports: '$' },
    underscore:   { exports: '_' },
    hammer:       { exports: 'Hammer', deps: ['jquery'] },
    modernizr:    { exports: 'Modernizr' },
    fastclick:    { exports: 'FastClick' },
    
    templates:    { exports: 'Templates' },
    searchjson:   { exports: 'SearchJSON' },
    
    backbone:     { exports: 'Backbone', deps: ['underscore', 'jquery'] },
    store:        { exports: 'Store', deps: ['backbone'] },
    queryengine:  { exports: 'QueryEngine', deps: ['backbone'] },
    
    bookview:     { exports: 'BookView' },
    router:       { exports: 'Router' }
  }
});

require([
  'bookview',
  'router',
  'modernizr'
], function(BookView, Router, Modernizr) {
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
  
  window.App = {};
  App.book = new BookView({ el: $('body')} );
  
  App.router = new Router();
  Backbone.history.start();
  
  require(['init']);
});

