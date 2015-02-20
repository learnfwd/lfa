define([
  'jquery',
  'underscore',
  'backbone',
  'bootstrap',
  'stacktable',
  'nlform',
  'templates',
  'fluidbox',
  'prefetcher',
], function($, _, Backbone, Bootstrap, Stacktable, NLForm, Templates, Fluidbox, Prefetcher) {
  'use strict';

  var ChapterView = Backbone.View.extend({
    initialize: function(options) {
      this.parent = options.parent;
      this.prefetcher = new Prefetcher();
    },

    render: function(chapter) {
      var tocUrlOrder = window.App.tocUrlOrder;

      if (!Templates.templateExists(chapter)) {
        chapter = tocUrlOrder[0]; // In lack of a 404
      }

      var lastChapter = window.App.book.currentChapter;
      window.App.book.currentChapter = chapter;
      
      // Determine the next and previous chapters.
      var next = null,
        previous = null;


      var firstIndex = 0,
        currentIndex = tocUrlOrder.indexOf(chapter),
        chapterCount = tocUrlOrder.length,
        lastIndex = chapterCount - 1;
      
      if (chapterCount > 1) {
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

      var nextUrl = window.App.tocUrlOrder[next],
        previousUrl = window.App.tocUrlOrder[previous];

      // Save them locally
      this.nextChapter = nextUrl;
      this.previousChapter = previousUrl;

      // Set them in HTML.
      $('#next-chapter').prop('href', '#book/' + nextUrl);
      $('#previous-chapter').prop('href', '#book/' + previousUrl);

      // If not cached, put up a loading screen
      if (typeof(Templates[chapter]) !== 'string') {
        this.$el.html(window.getMixin('error-message')());
      }

      window.App.book.trigger('destroy-chapter', {
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

      Templates.asyncLoad(chapter, this.chapterLoaded.bind(this, chapter));
    },

    chapterLoaded: function(chapter, error, htmlData) {

      this.$el.html(htmlData);

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
      $('body').addClass(window.App.tocFindByUrl[chapter].locals.cssNamespace);

      window.App.book.trigger('render', {
        chapter: chapter
      });

      // After the content loads, juice it up with some javascript.

      // Enable responsive tables.
      this.$('table.table-responsive').stacktable({
        myClass: 'stacktable small-only'
      });

      // Enable fancy forms.
      this.$('form.fancy').each(function() {
        // TODO: fix this hack.
        $(this).prepend('<div class="nl-overlay"></div>');
        return new NLForm($(this)[0]);
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

      // Enable lightboxes.
      this.$('a.lightbox').fluidbox();
    }
  });

  return ChapterView;
});
