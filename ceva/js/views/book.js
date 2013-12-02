'use strict';

define([
  'jquery',
  'underscore',
  'backbone',
  'templates'
], function($, _, Backbone) {
  var BookView = Backbone.View.extend({
    el: '#textbook',
    
    template: templates,
    
    render: function(chapter) {
      this.$el.html(this.template[chapter]());
      return this;
    }
  });
  
  return BookView;
});