'use strict';

require.config({
  paths: {
    // General purpose 3rd party libs.
    jQuery:       '../lfa-components/lfa-js/lib/jquery-2.0.3.min',
    underscore:   'underscore.min',
    Hammer:       'jquery.hammer.min',
    Modernizr:    '../lfa-components/lfa-js/lib/modernizr.touch.min',
    FastClick:    '../lfa-components/lfa-js/lib/fastclick',
    
    // LFA generated JSON objects.
    Templates:    'templates',
    SearchJSON:   'searchjson',
    
    // Backbone and accompanying libs.
    Backbone:     'backbone.min',
    Store:        'backbone.localStorage.min',
    QueryEngine:  'backbone.queryEngine',
    
    // Backbone classes.
    BookView:     'views/book',
    Router:       'routers/router'
  },
  shim: {
    jQuery:       { exports: '$' },
    underscore:   { exports: '_' },
    Hammer:       { exports: 'Hammer', deps: ['jQuery'] },
    Modernizr:    { exports: 'Modernizr' },
    FastClick:    { exports: 'FastClick' },
    
    Templates:    { exports: 'Templates' },
    SearchJSON:   { exports: 'SearchJSON' },
    
    Backbone:     { exports: 'Backbone', deps: ['underscore', 'jQuery'] },
    Store:        { exports: 'Store', deps: ['Backbone'] },
    QueryEngine:  { exports: 'QueryEngine', deps: ['Backbone'] },
    
    BookView:     { exports: 'BookView' },
    Router:       { exports: 'Router' }
  }
});

require([
  'Backbone',
  'BookView',
  'Router',
  'FastClick',
  'Templates',
  'SearchJSON',
  'QueryEngine',
  'Modernizr',
  'Hammer'
], function(Backbone, BookView, Router, FastClick, Templates, SearchJSON, QueryEngine, Modernizr, Hammer) {
  // Initialize FastClick. This removes the .3s delay in mobile webkit when clicking on anything.
  FastClick.attach(document.body);
  
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
  
  App.BookView = new BookView();
  
  App.Router = new Router();
  Backbone.history.start();
  
  var $body = $('body'),
      $leftbar = $('#leftbar'),
      $rightbar = $('#rightbar'),
      $textbook = $('#textbook'),
      $leftbarToggle = $('#leftbar-toggle'),
      $rightbarToggle = $('#rightbar-toggle'),
      $searchInput = $('#search input.search'),
      $searchErase = $('#search-erase'),
      $searchGo = $('#search-go');
  
  // TODO: Turn this into an option at the bottom of the rightbar.
  $body.addClass('high-performance');
  
  if (!Modernizr.touch) {
    $body.addClass('no-touch');
    
    // no-touch means we have a mouse, so don't scroll the entire document while we're inside a sidebar.
    $('body > nav, body > aside')
      .on('mouseover', function() {
      $body.addClass('no-scroll');
    }).on('mouseout', function() {
      $body.removeClass('no-scroll');
    });
  }
  
  if (Modernizr.appleios) {
    $body.addClass('appleios');
  } else {
    // If we're not on iOS, add events to open the sidebars via swiping left/right.
    // iOS doesn't get these because iOS 7 Safari uses them for back/forward.
    $textbook.hammer().on('dragleft', function() {
      $body.addClass('rightbar-active');
    });
    $textbook.hammer().on('dragright', function() {
      $body.addClass('leftbar-active');
    });
  }
  
  $leftbarToggle.click(function() {
    $body.toggleClass('leftbar-active');
  });
  $rightbarToggle.click(function() {
    $body.toggleClass('rightbar-active');
  });
  
  // Close the sidebars when we click anywhere on the textbook content.
  $textbook.hammer().on('tap', function() {
    $body.removeClass('leftbar-active');
    $body.removeClass('rightbar-active');
    $body.removeClass('no-scroll');
  });
  
  // Close the sidebars when we drag on them in their corresponding directions.
  $leftbar.hammer().on('dragleft', function() {
    $body.removeClass('leftbar-active');
  });
  $rightbar.hammer().on('dragright', function() {
    $body.removeClass('rightbar-active');
  });
  
  // When navigating somewhere else in the toc, close the leftbar, remove the active class from the previous button, and add the active class to the one that was pressed.
  $leftbar.find('ul a').click(function() {
    $body.removeClass('leftbar-active');
    $leftbar.find('ul li').removeClass('active');
    $(this).parent().addClass('active');
    $body.find('.menu .header span').html($(this).find('span:first-child').html());
  });
  $rightbar.find('#search-results').click(function() {
    $body.removeClass('rightbar-active');
  });
  
  // TODO: Refactor searching into Backbone.
  var projectCollection, projectSearchCollection;
  
  projectCollection = QueryEngine.createLiveCollection(SearchJSON.pages);
  
  projectSearchCollection = projectCollection.createLiveChildCollection()
  .setFilter('search', function(model, searchString) {
    var pass = true, searchRegex;
    if (searchString) {
      var searchTerms = searchString.split(/\s+/);
      for (var i = 0, len = searchTerms.length; i < len && pass; i++) {
        searchRegex = queryEngine.createSafeRegex(searchTerms[i]);
        pass = pass && (searchRegex.test(model.get('body')) || searchRegex.test(model.get('title')));
      }
    }
    return pass;
  }).query();
  
  $searchInput.on('input', function(e) {
    var searchString = $(this).val().trim();
    if (searchString.length >= 3) {
      var results = projectSearchCollection.setSearchString(searchString).query().models,
          maxResults = 5;
      
      var buf = '';
      for (var i = 0, len = results.length; i < len && i < maxResults; i++) {
        buf += Templates['search_result'](results[i].attributes);
      }
      $('#search-results').html(buf);
    } else {
      $('#search-results').html('');
    }
    
    if (searchString.length && $searchErase.hasClass('concealed')) {
      $searchErase.removeClass('concealed');
      $searchGo.addClass('concealed');
    } else if (!searchString.length) {
      $searchErase.addClass('concealed');
      $searchGo.removeClass('concealed');
    }
  });
  
  $searchErase.not('concealed').click(function() {
    $searchInput.val('');
    $('#search-results').html('');
    
    $searchErase.addClass('concealed');
    $searchGo.removeClass('concealed');
  });
  
  require(['init']);
});

