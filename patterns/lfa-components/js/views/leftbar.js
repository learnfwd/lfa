define([
  'jquery',
  'underscore',
  'backbone',
  'hammer',
  
  'views/sidebar'
], function($, _, Backbone, Hammer, SidebarView) {
  'use strict';
  
  var LeftbarView = SidebarView.extend({
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