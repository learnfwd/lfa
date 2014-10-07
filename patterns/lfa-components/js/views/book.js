define([
  'jquery',
  'underscore',
  'backbone',
  'store',
  'modernizr',
  'fastclick',
  'searchjson',
  
  'views/leftbar',
  'views/rightbar',
  'views/chapter',
  'views/menu'
], function($, _, Backbone, Store, Modernizr, FastClick, SearchJSON, LeftbarView, RightbarView, ChapterView, MenuView) {
  'use strict';
  
  var Setting = Backbone.Model.extend({
    defaults: {
      title: '',
      value: false
    },
    
    toggle: function () {
      this.save({
        completed: !this.get('value')
      });
    }
  });
  
  var SettingsCollection = Backbone.Collection.extend({
    model: Setting,
    localStorage: new Store('lfa-settings')
  });
  
  var Settings = new SettingsCollection();
  // Fetch from localStorage.
  Settings.fetch();
  
  // Initialize settings if they don't exist.
  if (!Settings.findWhere({ title: 'Animations' })) {
    var animDefault = new Setting({ title: 'Animations', value: true });
    Settings.add(animDefault);
    animDefault.save();
  }
  
  var BookView = Backbone.View.extend({
    html: $('html'),
    
    initialize: function() {
      // Initialize/alias some helpful arrays and hashtables.
      
      // Alias the SearchJSON to our global namespace.
      window.App.searchJSON = SearchJSON.pages;
  
      // Alias the TOC as well.
      window.App.toc = SearchJSON.toc || [];

      // App.tocUrlOrder is a sorted array that will tell you in what order the
      // TOC chapters are supposed to be consumed.
      window.App.tocUrlOrder = window.App.tocUrlOrder || SearchJSON.spine || [];

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
      window.App.tocFindByUrl = window.App.tocFindByUrl || getChildrenUrls(App.toc);

      // Initialize FastClick. This removes the .3s delay in mobile webkit when clicking on anything.
      FastClick.attach(document.body);

      // Bind keyboard events
      $(window).on('keyup', this.onKeyUp.bind(this));
      this.keyNavigationEnabled = true;
      
      if (Settings.findWhere({ title: 'Animations' }).get('value')) {
        this.$el.addClass('animated');
      } else {
        this.$('#animations-toggle').addClass('active');
      }
      
      var self = this;
      // Close the sidebars when we tap anywhere on the textbook.
      this.$('section.container').on('click', function() {
        self.closeSidebars();
      });

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
      window.App.router.navigate(nextChapterUrl, { trigger: true });
    },

    showPreviousChapter: function () {
      var previousChapterUrl =  'book/' + this.chapter.previousChapter;
      window.App.router.navigate(previousChapterUrl, { trigger: true });
    },
    
    showFirstChapter: function() {
      var firstChapterUrl = 'book/' + window.App.tocUrlOrder[0];
      window.App.router.navigate(firstChapterUrl, { replace: true, trigger: true });
    },
    
    show: function(chapter, id) {
      var changeChapter = window.App.book.currentChapter !== chapter;

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
      'click #animations-toggle': function() {
        this.$el.toggleClass('animated');
        this.$('#animations-toggle').toggleClass('active');
        this.closeSidebars();
        Settings.findWhere({ title: 'Animations' }).set('value', this.$el.hasClass('animated')).save();
      }
    }
  });
  
  return BookView;
});
