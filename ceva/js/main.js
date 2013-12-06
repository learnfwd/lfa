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
    },
    modernizr: {
      exports: 'Modernizr'
    },
    tipue: {
      deps: ['jquery', 'tipueSet', 'tipueContent']
    }
  },
  paths: {
    jquery: 'http://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min',
    templates: 'templates',
    underscore: 'underscore.min',
    backbone: 'backbone.min',
    backboneLocalstorage: 'backbone.localStorage.min',
    fastclick: '../lfa-components/lfa-js/lib/fastclick',
    hammer: 'jquery.hammer.min',
    modernizr: '../lfa-components/lfa-js/lib/modernizr.touch.min',
    
    tipueSet: 'tipuesearch/tipuesearch_set',
    tipueContent: 'tipuesearch/tipuesearch_content',
    tipue: 'tipuesearch/tipuesearch'
  }
});

require([
  'backbone',
  'views/book',
  'routers/router',
  'fastclick',
  'hammer',
  'modernizr',
  'tipue'
], function(Backbone, BookView, Workspace, FastClick, Hammer, Modernizr) {
  console.log('JavaScript loaded.');
  FastClick.attach(document.body);
  
  window.App = {};
  
  App.BookView = new BookView();
  
  App.Router = new Workspace();
  Backbone.history.start();
  
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
  
  var $body = $('body'),
      $leftbar = $body.find('> nav'),
      $rightbar = $body.find('> aside'),
      $textbook = $body.find('#textbook'),
      $leftbarToggle = $body.find('#leftbar-toggle'),
      $rightbarToggle = $body.find('#rightbar-toggle'),
      $searchInput = $body.find('#search input.search'),
      $searchErase = $body.find('#search-erase'),
      $searchGo = $body.find('#search-go');
  
  $searchInput.tipuesearch({
    'searchOutput': '#tipue_search_content'
  });
  
  $body.addClass('high-performance');
  
  if (!Modernizr.touch) {
    $body.addClass('no-touch');
  
    // Desktop classes to stop document scrolling while we're inside a sidebar.
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
    // If we're not on an iPod or iPhone, add events to open the sidebars via swiping left/right. iOS doesn't get these because iOS 7 Safari uses them for back/forward.
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
  $rightbar.find('a').click(function() {
    $body.removeClass('rightbar-active');
  });
  
  $searchInput.on('input', function(e) {
    var value = $(this).val();
    
    if (value.length && $searchErase.hasClass('concealed')) {
      $searchErase.removeClass('concealed');
      $searchGo.addClass('concealed');
    } else if (!value.length) {
      $searchErase.addClass('concealed');
      $searchGo.removeClass('concealed');
    }
  });
  
  $searchErase.not('concealed').click(function() {
    $searchInput.val('');
    
    $searchErase.addClass('concealed');
    $searchGo.removeClass('concealed');
  });
});
