define([
  'jquery',
  'underscore',
  'backbone',
  'bootstrap',
  'stacktable',
  'nlform',
  'templates',
  'fluidbox'
], function($, _, Backbone, Bootstrap, Stacktable, NLForm, Templates, Fluidbox) {
  'use strict';
  
  var ChapterView = Backbone.View.extend({
    initialize: function(options) {
      this.parent = options.parent;
    },
    
    render: function(chapter) {
      this.$el.html(Templates[chapter]);
      
      window.App.book.trigger('render', { chapter: chapter });
      
      // Determine the next and previous chapters.
      var next = null, previous = null;
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
      
      this.$('a.lightbox').fluidbox();
    }
  });
  
  return ChapterView;
});