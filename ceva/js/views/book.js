'use strict';

define([
  'jQuery',
  'underscore',
  'Backbone',
  'Templates'
], function($, _, Backbone, Templates) {
  var BookView = Backbone.View.extend({
    el: '#textbook',
    
    template: Templates,
    
    render: function(chapter) {
      this.$el.html(this.template[chapter]());
      return this;
    }
  });
  
  return BookView;
});