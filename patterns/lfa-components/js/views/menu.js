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
        'classes': {
          'initial':  'headroom',
          'pinned':   'pinned',
          'unpinned': 'unpinned'
        }
      });
      headroom.init();
    },
    
    events: {
      'click #leftbar-toggle': function() {
        this.parent.leftbar.toggle();
      },
      'click #rightbar-toggle': function() {
        this.parent.rightbar.toggle();
      }
    }
  });
  
  return MenuView;
});