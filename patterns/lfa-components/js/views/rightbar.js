define([
  'jquery',
  'underscore',
  'backbone',
  
  'views/sidebar',
  'views/search'
], function($, _, Backbone, SidebarView, SearchView) {
  'use strict';
  
  var RightbarView = SidebarView.extend({
    initialize: function(options) {
      // Execute the original SidebarView initializations.
      this.constructor.__super__.initialize.apply(this, [options]);
      
      // this.search = new SearchView({
      //   el: this.$('#search'),
      //   parent: this
      // });
    }
  });
  
  return RightbarView;
});