define([
  'jquery',
  'underscore',
  'backbone',
  'hammer',
  'bootstrap',
  'stacktable',
  'nlform',
  'templates'
], function($, _, Backbone, Hammer, Bootstrap, Stacktable, NLForm, Templates) {
  'use strict';
  
  var ChapterView = Backbone.View.extend({
    initialize: function(options) {
      this.parent = options.parent;
    },
    
    render: function(chapter) {
      window.App.book.trigger('render');
      
      this.$el.html(Templates[chapter]);
      
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
    }
  });
  
  return ChapterView;
});