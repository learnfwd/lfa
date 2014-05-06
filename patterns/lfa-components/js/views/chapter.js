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
  'sketchpad'
], function($, _, Backbone, Bootstrap, Stacktable, NLForm, Templates, Fluidbox, Raphael, Sketchpad) {
  'use strict';

  var ChapterView = Backbone.View.extend({
    initialize: function(options) {
      this.parent = options.parent;
    },

    render: function(chapter) {
      this.$el.html(Templates[chapter]);

      window.App.book.trigger('render', {
        chapter: chapter
      });

      // Determine the next and previous chapters.
      var next = null,
        previous = null;
      var $chapters = $('#leftbar li');

      if ($chapters.length > 1) {
        for (var i = 0, len = $chapters.length; i < len; i++) {
          if ($($chapters[i]).hasClass('active')) {
            if (i === 0) {
              previous = $chapters[len - 1];
              next = $chapters[i + 1];
            } else if (i === (len - 1)) {
              previous = $chapters[i - 1];
              next = $chapters[0];
            } else {
              previous = $chapters[i - 1];
              next = $chapters[i + 1];
            }
          }
        }
      } else {
        next = previous = $($chapters[0]);
      }
      var nextTitle = $(next).children('a').children('span.title').html(),
        previousTitle = $(previous).children('a').children('span.title').html();

      next = $(next).children('a').prop('href');
      previous = $(previous).children('a').prop('href');

      // Set them in HTML.
      $('#btn-previous').prop('href', previous).html(previousTitle);
      $('#btn-next').prop('href', next).html(nextTitle);

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
