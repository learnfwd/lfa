define([
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone) {
  'use strict';
  
  var MenuView = Backbone.View.extend({
    initialize: function(options) {
      this.parent = options.parent;
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