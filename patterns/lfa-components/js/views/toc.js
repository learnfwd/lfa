define([
  'jquery',
  'underscore',
  'backbone',
], function($, _, Backbone) {
  'use strict';

  var TocView = Backbone.View.extend({
    initialize: function(options) {
      this.constructor.__super__.initialize.apply(this, [options]);

      if (options.url) {
        this.chapters = window.App.tocFindByUrl[options.url].children;
      } else {
        this.chapters = window.App.toc;
      }

      this.render();
    },

    render: function() {
      this.$el.html(window.getMixin('_toc')(this.chapters));
    },

  });

  window.TocView = TocView;

  return TocView;
});
