var $ = require('jquery');
var Backbone = require('backbone');
var Headroom = require('headroom');
var BuildInfo = require('lfa-book').BuildInfo;

var MenuView = Backbone.View.extend({
  initialize: function(options) {
    this.parent = options.parent;

    var headroom = new Headroom(this.el, {
      scroller: $('#scrollview')[0],
      classes: {
        initial:  'headroom',
        pinned:   'pinned',
        unpinned: 'unpinned'
      }
    });
    headroom.init();

    $(window).on('scroll', function(e) {
      var $body = $('body');
      if ($body.hasClass('leftbar-active') || $body.hasClass('rightbar-active')) {
        e.stopPropagation();
      }
    });
  },

  events: {
    'click #leftbar-toggle': function() {
      if (BuildInfo.textDirection === 'rtl') {
        this.parent.rightbar.toggle();
      } else {
        this.parent.leftbar.toggle();
      }
    },
    'click #rightbar-toggle': function() {
      if (BuildInfo.textDirection === 'rtl') {
        this.parent.leftbar.toggle();
      } else {
        this.parent.rightbar.toggle();
      }
    },
    'mouseenter .menu-item': function() {
      this.$el.removeClass('unpinned').addClass('pinned');
    },
  }
});

module.exports = MenuView;
