var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backbone');
var BuildInfo = require('lfa-book').BuildInfo;
var App = require('../app');
var LeftbarView = require('./leftbar');
var RightbarView = require('./rightbar');
var ChapterView = require('./chapter');
var MenuView = require('./menu');

var BookView = Backbone.View.extend({
  html: $('html'),

  initialize: function() {
    // Initialize/alias some helpful arrays and hashtables.

    // Alias the BuildInfo to our global namespace.
    App.searchJSON = BuildInfo;

    // Alias the TOC as well.
    App.toc = BuildInfo.toc || [];

    // App.tocUrlOrder is a sorted array that will tell you in what order the
    // TOC chapters are supposed to be consumed.
    App.tocUrlOrder = App.tocUrlOrder || BuildInfo.spine || [];

    var getChildrenUrls = function(toc) {
      var result = {};

      for (var i = 0; i < toc.length; i++) {
        if (toc[i].children.length) {
          _.extend(
            result,
            getChildrenUrls(toc[i].children)
          );
        }
        result[toc[i].url] = toc[i];
      }

      return result;
    };

    // App.tocFindByUrl is a lookup table. It takes a url, and gives you the
    // TOC object for that particular string. Example:
    //   App.tocFindByUrl['ch01-01']
    // This object will contain the following fields:
    //   url (string)
    //   children (array)
    //   locals (object)
    App.tocFindByUrl = App.tocFindByUrl || getChildrenUrls(App.toc);

    // Bind keyboard events
    $(window).on('keyup', this.onKeyUp.bind(this));
    this.keyNavigationEnabled = true;

    this.$el.addClass('animated');

    var self = this;
    // Close the sidebars when we tap anywhere on the textbook.
    this.$('#content').on('click', function() {
      self.closeSidebars();
    });
    if ( BuildInfo.textDirection === 'rtl') {
      $(document).ready(function() {
        $('aside#rightbar').attr('id','leftbar');
        $('nav#leftbar').attr('id','rightbar');
        $('#leftbar-toggle').removeClass('menu-item-left').addClass('menu-item-right');
        $('#rightbar-toggle').removeClass('menu-item-right').addClass('menu-item-left');
        $('#previous-chapter').removeClass('menu-item-left').addClass('menu-item-right').html('<i class="fa fa-chevron-right menu-item-contents"></i>');
        $('#next-chapter').removeClass('menu-item-right').addClass('menu-item-left').html('<i class="fa fa-chevron-left menu-item-contents"></i>');
      });
      this.leftbar = new LeftbarView({
        el: this.$('#rightbar'),
        parent: this,
        classActive: 'leftbar-active',
        closeGesture: 'dragleft'
      });

      this.rightbar = new RightbarView({
        el: this.$('#leftbar'),
        parent: this,
        classActive: 'rightbar-active',
        closeGesture: 'dragright'
      });
    } else {
      this.leftbar = new LeftbarView({
        el: this.$('#leftbar'),
        parent: this,
        classActive: 'leftbar-active',
        closeGesture: 'dragleft'
      });

      this.rightbar = new RightbarView({
        el: this.$('#rightbar'),
        parent: this,
        classActive: 'rightbar-active',
        closeGesture: 'dragright'
      });
    }
    this.chapter = new ChapterView({
      el: this.$('#textbook'),
      parent: this
    });

    this.menu = new MenuView({
      el: this.$('.menu'),
      parent: this
    });

    this.menu = new MenuView({
      el: this.$('.navigation-menu'),
      parent: this
    });
  },

  showNextChapter: function () {
    var nextChapterUrl =  'book/' + this.chapter.nextChapter;
    App.router.navigate(nextChapterUrl, { trigger: true });
  },

  showPreviousChapter: function () {
    var previousChapterUrl =  'book/' + this.chapter.previousChapter;
    App.router.navigate(previousChapterUrl, { trigger: true });
  },

  showFirstChapter: function() {
    var firstChapterUrl = 'book/' + App.tocUrlOrder[0];
    App.router.navigate(firstChapterUrl, { replace: true, trigger: true });
  },

  show: function(chapter, id) {
    var changeChapter = App.book.currentChapter !== chapter;

    var scrollView = $('#scrollview');

    // When navigating somewhere else in the toc,
    // scroll the user to the top of the page, or to the
    // corresponding id
    if (changeChapter || !id) {
      scrollView.scrollTop(0);
    }

    // close the sidebars if we're on a phone/portrait tablet,
    if ($(window).width() <= 768) {
      this.closeSidebars();
    }

    // remove the active class from the previous button and
    // add the active class to the one that was pressed.
    this.leftbar.makeActive(chapter, id);

    if (changeChapter) {
      this.chapter.render(chapter);
    }

    if (id) {
      var anchor = this.chapter.$el.find('#' + id);
      if (anchor && anchor.length) {
        var scrollPos = anchor.offset().top - scrollView.offset().top;
        scrollPos += scrollView.scrollTop();
        scrollPos -= 50; // For good measure
        scrollView.scrollTop(scrollPos);
      } else {
        if (!changeChapter) {
          scrollView.scrollTop(0);
        }
      }
    }
  },

  getKeyNavigationEnabled: function () {
    return this.keyNavigationEnabled;
  },

  setKeyNavigationEnabled: function (val) {
    this.keyNavigationEnabled = val;
  },

  onKeyUp: function (evt) {
    if (!this.keyNavigationEnabled) {
      return;
    }
    var keyCode = evt.which;
    if (keyCode !== 39 && keyCode !== 37) {
      return;
    }
    if (evt.target.nodeName === 'INPUT') {
      return;
    }
    var body = $('body');
    if (body.hasClass('leftbar-active') || body.hasClass('rightbar-active')) {
      return;
    }
    if (keyCode === 39) {
      this.showNextChapter();
    } else {
      this.showPreviousChapter();
    }
  },

  closeSidebars: function() {
    this.leftbar.close();
    this.rightbar.close();
  },

  events: {
  }
});

module.exports = BookView;
