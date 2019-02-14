var $ = require('jquery');
var Backbone = require('backbone');
var Headroom = require('headroom');

function toggleFullScreen() {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

var MenuView = Backbone.View.extend({
  initialize: function (options) {
    this.parent = options.parent;

    var headroom = new Headroom(this.el, {
      scroller: $('#scrollview')[0],
      classes: {
        initial: 'headroom',
        pinned: 'pinned',
        unpinned: 'unpinned',
      },
    });
    headroom.init();

    $(window).on('scroll', function (e) {
      var $body = $('body');
      if ($body.hasClass('leftbar-active')) {
        e.stopPropagation();
      }
    });

    if (!document.exitFullscreen && !document.msExitFullscreen && !document.mozCancelFullScreen && !document.webkitExitFullscreen) {
      $('#go-fullscreen').hide();
      $('#menu').addClass('no-fullscreen');
    }
  },

  events: {
    'click #leftbar-toggle': function () {
      this.parent.leftbar.toggle();
    },
    'click #go-fullscreen': function () {
      toggleFullScreen();
    },
    'mouseenter .menu-item': function () {
      this.$el.removeClass('unpinned').addClass('pinned');
    },
  },
});

module.exports = MenuView;
