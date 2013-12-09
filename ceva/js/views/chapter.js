'use strict';

define([
  'jquery',
  'underscore',
  'backbone',
  'hammer',
  'templates'
], function($, _, Backbone, Hammer, Templates) {
  var ChapterView = Backbone.View.extend({
    initialize: function(options) {
      this.parent = options.parent;
      
      // Close the sidebars when we click anywhere on the textbook content.
      var self = this;
      this.$el.hammer().on('tap', function() {
        self.parent.closeSidebars();
        self.parent.allowScrolling();
      });
      
      if (!this.parent.html.hasClass('appleios')) {
        // If we're not on iOS, add events to open the sidebars via swiping left/right.
        // iOS doesn't get these because iOS 7 Safari uses them for back/forward.
        this.$el.hammer().on('dragright', function() {
          self.parent.leftbar.open();
        });
        this.$el.hammer().on('dragleft', function() {
          self.parent.rightbar.open();
        });
      }
    },
    
    getFirstChapter: function() {
      for (var chapter in Templates) return chapter;
    },
    
    render: function(chapter) {
      this.$el.html(Templates[chapter]);
    }
  });
  
  return ChapterView;
});