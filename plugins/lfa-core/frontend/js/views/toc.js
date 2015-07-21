var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');

var templates = require('templates');
var App = require('../app');

var TocView = Backbone.View.extend({
  initialize: function(options) {
    this.constructor.__super__.initialize.apply(this, [options]);

    if (options.url) {
      this.chapters = App.tocFindByUrl[options.url].children;
    } else {
      this.chapters = App.toc;
    }

    this.render();

  },

  calculateHeights: function() {
    var self = this;

    self.tocTree = {};

    function addToTree(el, parent) {
      var url = el.data('url');
      var children = el.children('.children-container');
      if (!children.length) { return; }
      var inner = children.children('ul');

      var h = inner.outerHeight();
      var obj = {
        url: url,
        initialHeight: h,
        height: h,
        folded: true,
        parent: parent,
        childrenElement: children
      };

      self.tocTree[url] = obj;

      children.css('height', h);

      inner.children('li').each(function(idx, el) {
        addToTree($(el), obj);
      });
    }

    self.$el.children('ul').children('li').each(function (idx, el) {
      addToTree($(el), null);
    });
  },

  toggleFold: function(el, val) {
    var url = el.data('url');
    var obj = this.tocTree[url];
    if (!obj) { return; }
    if (val === undefined) {
      val = !obj.folded;
    }
    if (val === obj.folded) { return; }
    obj.folded = val;

    el.toggleClass('fold', val);

    var h = val ? -obj.height : obj.height;
    obj = obj.parent;
    while (obj) {
      obj.height += h;
      obj.childrenElement.css('height', obj.height);
      obj = obj.folded ? null : obj.parent;
    }
  },

  render: function() {
    var self = this;

    console.log(this.chapters);
    this.$el.html(templates.toc.toc(this.chapters));
    this.calculateHeights();

    this.$('li').on('click', function(e) {
      e.stopPropagation();
      self.toggleFold($(this));
    });
  },

});

module.exports = TocView;
