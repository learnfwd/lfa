require.config({
  waitSeconds: 0, // Indefinite timeout (good for low end devices)
  paths: {
    // General purpose 3rd party libs.
    jquery:       'lib/jquery-2.1.1.min',
    underscore:   'lib/underscore-min',
    hammer:       'lib/jquery.hammer.min',
    modernizr:    'lib/modernizr.touch.min',
    fastclick:    'lib/fastclick',
    bootstrap:    'lib/bootstrap.min',
    nlform:       'lib/nl-form',
    stacktable:   'lib/stacktable',
    headroom:     'lib/headroom.min',
    fluidbox:     'lib/fluidbox.min',
    raphael:      'lib/raphael.min',
    sketchpad:    'lib/raphael.sketchpad',
    notify:       'lib/notify.min',
    buzz:         'lib/buzz.min',

    // Rangy and its fat suite of deps.
    rangycore:    'lib/rangy/rangy-core',
    rangycss:     'lib/rangy/rangy-cssclassapplier',
    rangyhilite:  'lib/rangy/rangy-highlighter',
    rangyselect:  'lib/rangy/rangy-selectionsaverestore',
    rangyserial:  'lib/rangy/rangy-serializer',
    rangytext:    'lib/rangy/rangy-textrange',

    // Backbone and accompanying libs.
    backbone:     'lib/backbone-min',
    store:        'lib/backbone.localStorage.min',
    queryengine:  'lib/backbone.queryEngine',

    // Backbone classes.
    bookview:     'views/book',
    router:       'routers/router',

    // Global App object
    app:          'app',
    appStorage:   'storage',

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
    sketchpad:    { exports: 'Sketchpad', deps: ['raphael'] },
    notify:       { exports: 'Notify', deps: ['jquery'] },
    buzz:         { exports: 'Buzz', },

    rangycore:    { exports: 'rangycore' },
    rangycss:     { exports: 'rangycss', deps: ['rangycore'] },
    rangyhilite:  { exports: 'rangyhilite', deps: ['rangycss'] },
    rangyselect:  { exports: 'rangyselect', deps: ['rangyhilite'] },
    rangyserial:  { exports: 'rangyserial', deps: ['rangyselect'] },
    rangytext:    { exports: 'rangy', deps: ['rangyserial'] },

    backbone:     { exports: 'Backbone', deps: ['underscore', 'jquery'] },
    store:        { exports: 'Store', deps: ['backbone'] },
    queryengine:  { exports: 'QueryEngine', deps: ['backbone'] },

    app:          { exports: 'App'},
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
  'notify',
  'app'
], function($, Backbone, Modernizr, Notify, App) {
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

  Modernizr.addTest('android', function () {
    return navigator.userAgent.match(/Android/i);
  });

  Modernizr.addTest('appleios', function () {
    return (Modernizr.ipad || Modernizr.ipod || Modernizr.iphone);
  });

  var ua = navigator.userAgent, r;
  var verIE = null;
  var isIE = (r = ua.match(/MSIE\s+([0-9]+)/)) || (ua.match(/Trident/) && (r = ua.match(/rv:([0-9]+)/)));
  if (isIE) {
    if (r && r.length >= 2 && !isNaN(parseInt(r[1]))) {
      verIE = parseInt(r[1]);
    }
  }

  Modernizr.addTest('msie', function () {
    return isIE;
  });

  Modernizr.addTest('msie10', function () {
    return isIE && verIE === 10;
  });

  Modernizr.addTest('msie10p', function () {
    return isIE && verIE >= 10;
  });

  Modernizr.addTest('msie11', function () {
    return isIE && verIE === 11;
  });

  Modernizr.addTest('msie11p', function () {
    return isIE && verIE >= 11;
  });

  // Execute textbook-specific javascript, if it exists.
  require(['../../js/main'], function() {
    // After everything is rendered the first time, trigger "ready"
    App.book.once('render', function() {
      App.trigger('ready');
    });

    // Then, start up the textbook.
    Backbone.history.start();
  });
  
});
