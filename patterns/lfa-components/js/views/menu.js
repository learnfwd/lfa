define([
  'jquery',
  'underscore',
  'backbone',
  'hammer'
], function($, _, Backbone, Hammer) {
  'use strict';
  
  var MenuView = Backbone.View.extend({
    initialize: function(options) {
      this.parent = options.parent;
    },
    
    setTitle: function(title) {
      this.$('.menu .header span').html(title);
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