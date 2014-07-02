define([
  'jquery',
  'underscore',
  'backbone',
  'hammer',
  
  'views/sidebar',
  'views/toc'
], function($, _, Backbone, Hammer, SidebarView, TocView) {
  'use strict';
  
  var LeftbarView = SidebarView.extend({
    initialize: function(options) {
      // Execute the original SidebarView initializations.
      this.constructor.__super__.initialize.apply(this, [options]);

      this.toc = new TocView({
        el: this.$el,
        parent: this
      });
      
      this.$('li').on('click', function(e) {
        e.stopPropagation();
        $(this).toggleClass('fold');
      });
    },
    
    makeActive: function(chapter, id) {
      this.$('ul li').removeClass('active');
      var $link = null;
      if (id) {
        $link = this.$('li a[href="#book/' + chapter + '/' + id + '"]');
      }
      if (!$link || !$link.length) {
        $link = this.$('li a[href="#book/' + chapter + '"]');
      }
      $link.parent().addClass('active');
      
      var $siblings = $link.parent().siblings();
      $siblings.each(function(index, sibling) {
        $(sibling).addClass('fold');
      });
      $link.parent().removeClass('fold');
      
      var title = $link.find('.title').text();
      return title;
    }
  });
  
  return LeftbarView;
});
