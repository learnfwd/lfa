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
    fluidbox:     'lib/fluidbox.min',
    
    // Rangy and its fat suite of deps.
    rangycore:    'lib/rangy/rangy-core',
    rangycss:     'lib/rangy/rangy-cssclassapplier',
    rangyhilite:  'lib/rangy/rangy-highlighter',
    rangyselect:  'lib/rangy/rangy-selectionsaverestore',
    rangyserial:  'lib/rangy/rangy-serializer',
    rangytext:    'lib/rangy/rangy-textrange',
    
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
    fluidbox:     { exports: 'Fluidbox', deps: ['jquery'] },
    
    rangycore:    { exports: 'rangycore' },
    rangycss:     { exports: 'rangycss', deps: ['rangycore'] },
    rangyhilite:  { exports: 'rangyhilite', deps: ['rangycss'] },
    rangyselect:  { exports: 'rangyselect', deps: ['rangyhilite'] },
    rangyserial:  { exports: 'rangyserial', deps: ['rangyselect'] },
    rangytext:    { exports: 'rangy', deps: ['rangyserial'] },
    
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
  
  // Execute textbook-specific javascript, if it exists.
  require(['../../js/main'], function() {
    // Then, start up the textbook.
    Backbone.history.start();
  });
});

