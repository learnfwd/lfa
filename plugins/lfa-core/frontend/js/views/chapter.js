var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
require('stacktable');
require('fluidbox');

var templates = require('templates');
var mixinCompiler = require('../mixin-compiler');
var Chapters = require('../chapters');
var Prefetcher = require('../prefetcher');
var App = require('../app');
var HotChapterReload = require('lfa-book').HotChapterReload;

var ChapterView = Backbone.View.extend({
  initialize: function(options) {
    this.parent = options.parent;
    this.prefetcher = new Prefetcher();
    this.chapterViewId = _.uniqueId();
    HotChapterReload.register(this.invalidatedChapter, this);
  },

  remove: function() {
    HotChapterReload.deregister(this.invalidatedChapter);
    Backbone.View.remove.apply(this, arguments);
  },

  invalidatedChapter: function(chapter) {
    this.prefetcher.invalidateCacheForChapter(chapter);
    if (chapter === App.book.currentChapter) { 
      this.render(chapter);
    }
  },

  render: function(chapter) {
    var tocUrlOrder = App.tocUrlOrder;

    if (!Chapters.chapterExists(chapter)) {
      chapter = tocUrlOrder[0]; // In lack of a 404
    }

    var lastChapter = App.book.currentChapter;
    App.book.currentChapter = chapter;
    
    // Determine the next and previous chapters.
    var next = null,
      previous = null;


    var firstIndex = 0,
      currentIndex = tocUrlOrder.indexOf(chapter),
      chapterCount = tocUrlOrder.length,
      lastIndex = chapterCount - 1;
    
    if (chapterCount > 1 && currentIndex !== -1) {
      if (currentIndex === 0) {
        next = currentIndex + 1;
        previous = lastIndex;
      } else if (currentIndex === lastIndex) {
        next = firstIndex;
        previous = currentIndex - 1;
      } else {
        next = currentIndex + 1;
        previous = currentIndex - 1;
      }
    } else {
      next = previous = firstIndex;
    }

    var nextUrl = App.tocUrlOrder[next],
      previousUrl = App.tocUrlOrder[previous];

    // Save them locally
    this.nextChapter = nextUrl;
    this.previousChapter = previousUrl;

    // Set them in HTML.
    $('#next-chapter').prop('href', '#book/' + nextUrl);
    $('#previous-chapter').prop('href', '#book/' + previousUrl);

    // If not cached, put up a loading screen
    if (Chapters.chapterLoaded(chapter)) {
      this.$el.html(templates['error-message']());
    }

    App.book.trigger('destroy-chapter', {
      chapter: lastChapter
    });

    // 4 [0] 1 2 3 5 6 ... 
    var priority = [chapter], i;
    for (i = currentIndex+1; i < currentIndex+4 && i < chapterCount && i !== previous; i++) {
      priority.push(tocUrlOrder[i]);
    }
    priority.push(tocUrlOrder[previous]);
    for (i = currentIndex+4; i < chapterCount && i !== previous; i++) {
      priority.push(tocUrlOrder[i]);
    }
    for (i = currentIndex-2; i >= 0; i--) {
      priority.push(tocUrlOrder[i]);
    }
    this.prefetcher.setChapterPriority(priority);

    Chapters.asyncLoad(chapter, this.chapterLoaded.bind(this, chapter));
  },

  chapterLoaded: function(chapter, error, template) {
    // For when the chapters come in the wrong order
    if (App.book.currentChapter !== chapter) { return; }

    App.book.trigger('pre-render', {
      chapter: chapter
    });

    var front, back;
    var data = mixinCompiler(template);
    if (data && data.indexOf("<section>") !== -1) {
      front = "<article>";
      back = "</article>";
    } else {
      front = "<article><section>";
      back = "</section></article>";
    }

    this.$el.html([front, data, back].join(''));

    // Remove previous cssNamespace classes, if they exist.
    var classes = _.filter(
      $('body')[0].className.split(' '),
      function(cls) {
        return cls.indexOf('lf-') === -1;
      }
    );
    // `classes` should no longer contain strings that start with `lf-`.
    $('body').removeClass();
    $('body').addClass(classes.join(' '));

    // Add the cssNamespace classes to the <body> element.
    var cssNamespace = chapter;
    try {
      cssNamespace = App.tocFindByUrl[chapter].locals.cssNamespace || cssNamespace;
    } catch (ex) {}
    $('body').addClass(cssNamespace);

    App.book.trigger('render', {
      chapter: chapter
    });

    // After the content loads, juice it up with some javascript.

    // Enable responsive tables.
    this.$('table.table-responsive').stacktable({
      myClass: 'stacktable small-only'
    });

    // Enable Bootstrap popovers.
    this.$el.popover({
      selector: '[rel=popover]'
    });

    // Enable real parallax, fading modals and fading tab-panes on desktops.
    if (this.parent.html.hasClass('no-touch')) {
      this.$('.parallax').each(function() {
        var $bgobj, $scrollView;
        $bgobj = $(this);
        $scrollView = $('#scrollview');
        return $scrollView.scroll(function() {
          var coords, yPos;
          yPos = -($scrollView.scrollTop() / 10);
          coords = '100% ' + yPos + 'px';
          return $bgobj.css({
            backgroundPosition: coords
          });
        });
      });

      // TODO: fold these over to CSS under the body.animation class.
      this.$('.modal').each(function() {
        return $(this).addClass('fade');
      });

      this.$('.tab-pane').each(function() {
        return $(this).addClass('fade');
      });
    }

    // Prevent navigating away
    this.$('a.lightbox').on('click', function (e) {
      e.preventDefault();
    });

    // Enable lightboxes.
    this.$('a.lightbox').fluidbox();
    var scrollPreventedEvents = 'wheel touchmove MSPointerMove pointermove';
    this.$el.on(scrollPreventedEvents, '.fluidbox.fluidbox-opened', function (e) {
      e.preventDefault();
    });
  }
});

module.exports = ChapterView;
