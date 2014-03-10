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
      
      this.$('.fold-chapter').click(function(e) {
        e.preventDefault();
        
        $(this).parent().parent().toggleClass('fold');
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