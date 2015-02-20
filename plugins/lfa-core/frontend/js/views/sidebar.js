define([
  'jquery',
  'underscore',
  'backbone',
  'hammer',
], function($, _, Backbone, Hammer) {
  'use strict';
  
  var SidebarView = Backbone.View.extend({
    initialize: function(options) {
      this.parent = options.parent;
      this.classActive = options.classActive;
      this.closeGesture = options.closeGesture;

      var self = this;
      
      self.$el.hammer().on(self.closeGesture, function(evt) {
        if (Math.abs(evt.gesture.deltaX) > 50) {
          self.close();
        }
        evt.preventDefault();
      });
    },
    
    events: function() {
      var events = {};
      return events;
    },
    
    open: function() {
      if (this.isOpen) { return; }
      this.parent.closeSidebars();
      this.parent.trigger('sidebar:open', this.classActive);
      this.parent.$el.addClass(this.classActive);
      this.isOpen = true;
    },
    
    close: function() {
      if (!this.isOpen) { return; }
      this.parent.trigger('sidebar:close', this.classActive);
      this.parent.$el.removeClass(this.classActive);
      this.isOpen = false;
    },
    
    toggle: function() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }
  });
  
  return SidebarView;
});
