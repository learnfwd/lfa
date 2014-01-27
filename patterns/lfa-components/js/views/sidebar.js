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
      
      // // no-touch means we have a mouse, so don't scroll the entire document while we're inside a sidebar.
      // if (this.parent.html.hasClass('no-touch')) {
      //   events = {
      //     'mouseover': function() {
      //       this.parent.disableScrolling();
      //     },
      //     'mouseout': function() {
      //       this.parent.allowScrolling();
      //     }
      //   };
      // }
      
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