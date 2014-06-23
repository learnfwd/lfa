define([
  'jquery',
  'underscore',
  'backbone',
  'bootstrap',
  'stacktable',
  'nlform',
  'templates',
  'fluidbox',
  'raphael',
  'sketchpad',
  'prefetcher',
], function($, _, Backbone, Bootstrap, Stacktable, NLForm, Templates, Fluidbox, Raphael, Sketchpad, Prefetcher) {
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

      // Set them in HTML.
      $('#next-chapter').prop('href', '#book/' + nextUrl);
      $('#previous-chapter').prop('href', '#book/' + previousUrl);

      // If not cached, put up a loading screen
      if (typeof(Templates[chapter]) !== 'string') {
        this.$el.html(window.getMixin('error-message')());
      }

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
          var $bgobj, $window;
          $bgobj = $(this);
          $window = $(window);
          return $window.scroll(function() {
            var coords, yPos;
            yPos = -($window.scrollTop() / 10);
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

      // Enable sketchpads.
      $('.sketchpad').each(function(index, sketch) {
        var $sketch = $(sketch);
        var $editor = $sketch.find('.editor');

        var width = $sketch.data('width') || $editor.parent().width();
        var height = $sketch.data('height') || width;
        var primaryColor = $sketch.data('primary-color');
        var secondaryColor = $sketch.data('secondary-color');
        var backgroundColor = $sketch.data('background-color');

        var paper = new Raphael($editor[0], width, height);
        var sketchpad = Raphael.sketchpad(paper);
        sketchpad.pen().color(primaryColor);

        $editor.children('svg').css('background-color', backgroundColor);

        var $colorSwitcher = $sketch.find('.btn-color-switcher');
        var $eraser = $sketch.find('.btn-eraser');
        var $undo = $sketch.find('.btn-undo');
        var $redo = $sketch.find('.btn-redo');
        var $destroy = $sketch.find('.btn-destroy');
        var $save = $sketch.find('.btn-save');

        $colorSwitcher.on('click', function() {
          $eraser.removeClass('active');
          sketchpad.pen().width(5);

          if ($(this).hasClass('active')) {
            sketchpad.pen().color(primaryColor);
            $(this).css('color', primaryColor);
            $(this).removeClass('active');
          } else {
            sketchpad.pen().color(secondaryColor);
            $(this).css('color', secondaryColor);
            $(this).addClass('active');
          }
        });

        $eraser.on('click', function() {
          if ($(this).hasClass('active')) {
            sketchpad.pen().width(5);
            if ($colorSwitcher.hasClass('active')) {
              sketchpad.pen().color(secondaryColor);
            } else {
              sketchpad.pen().color(primaryColor);
            }
            $(this).removeClass('active');
          } else {
            sketchpad.pen().color(backgroundColor);
            sketchpad.pen().width(25);
            $(this).addClass('active');
          }
        });

        $undo.on('click', function() {
          sketchpad.undo();
        });

        $redo.on('click', function() {
          sketchpad.redo();
        });

        $destroy.on('click', function() {
          sketchpad.clear();
        });

        $save.on('click', function() {
          console.log(sketchpad.json());
        });
      });
    }
  });

  return ChapterView;
});
