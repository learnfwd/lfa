define([
  'jquery',
  'underscore',
  'backbone',
  'hammer',
  
  'views/sidebar'
], function($, _, Backbone, Hammer, SidebarView) {
  'use strict';
  
  var LeftbarView = SidebarView.extend({
    initialize: function(options) {
      // Execute the original SidebarView initializations.
      this.constructor.__super__.initialize.apply(this, [options]);
      
      this.$('li').click(function(e) {
        e.preventDefault();
        console.log('click');
        // $(this).toggleClass('fold');
      });
    },
    
    makeActive: function(chapter) {
      this.$('ul li').removeClass('active');
      var $link = this.$('li a[href="#book/' + chapter + '"]');
      $link.parent().addClass('active');
      
      var title = $link.find('.title').text();
      return title;
    }
  });
  
  return LeftbarView;
});