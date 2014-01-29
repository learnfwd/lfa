define([
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone) {
  'use strict';
  
  var SidebarView = Backbone.View.extend({
    initialize: function(options) {
      this.parent = options.parent;
      this.classActive = options.classActive;
      this.closeGesture = options.closeGesture;
      
      var self = this;
      if (!this.parent.html.hasClass('appleios')) {
        // If we're not on iOS, add events to close the sidebars via swiping left/right.
        // iOS doesn't get these because iOS 7 Safari uses them for back/forward.
        this.$el.hammer().on(this.closeGesture, function() {
          self.close();
        });
      }
    },
    
    events: function() {
      var events = {};
      
      return events;
    },
    
    open: function() {
      this.parent.closeSidebars();
      this.parent.$el.addClass(this.classActive);
    },
    
    close: function() {
      this.parent.$el.removeClass(this.classActive);
    },
    
    toggle: function() {
      this.parent.$el.toggleClass(this.classActive);
    }
  });
  
  return SidebarView;
});