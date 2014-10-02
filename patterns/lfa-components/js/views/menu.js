define([
  'jquery',
  'underscore',
  'backbone',
  'headroom'
], function($, _, Backbone, Headroom) {
  'use strict';
  
  var MenuView = Backbone.View.extend({
    initialize: function(options) {
      this.parent = options.parent;
      
      var headroom = new Headroom(document.querySelector(this.$el.selector), {
        scrollElement: $('#scrollview')[0],
        'classes': {
          'initial':  'headroom',
          'pinned':   'pinned',
          'unpinned': 'unpinned'
        }
      });
      headroom.init();

      $(window).on('scroll', function(e) {
        var $body = $('body');
        if ($body.hasClass('leftbar-active') || $body.hasClass('rightbar-active')) {
          e.stopPropagation();
        }
      });
    },
    
    events: {
      'click #leftbar-toggle': function() {
        this.parent.leftbar.toggle();
      },
      'click #rightbar-toggle': function() {
        this.parent.rightbar.toggle();
      },
      'mouseenter .menu-item': function() {
        this.$el.removeClass('unpinned').addClass('pinned');
      },
    }
  });
  
  return MenuView;
});
