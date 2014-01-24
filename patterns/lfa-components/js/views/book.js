define([
  'jquery',
  'underscore',
  'backbone',
  'store',
  'modernizr',
  'fastclick',
  
  'views/leftbar',
  'views/rightbar',
  'views/chapter',
  'views/menu'
], function($, _, Backbone, Store, Modernizr, FastClick, LeftbarView, RightbarView, ChapterView, MenuView) {
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
      // Initialize FastClick. This removes the .3s delay in mobile webkit when clicking on anything.
      FastClick.attach(document.body);
      
      if (Settings.findWhere({ title: 'Animations' }).get('value')) {
        this.$el.addClass('animated');
      }
      
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
    },
    
    showFirstChapter: function() {
      var firstChapterUrl = this.leftbar.$('ul li a[href]')[0].attributes.href.value;
      window.App.router.navigate(firstChapterUrl, true);
    },
    
    show: function(chapter) {
      // When navigating somewhere else in the toc, close sidebars,
      // remove the active class from the previous button,
      // add the active class to the one that was pressed.
      this.closeSidebars();
      this.leftbar.makeActive(chapter);
      this.chapter.render(chapter);
    },
    
    closeSidebars: function() {
      this.leftbar.close();
      this.rightbar.close();
    },
    
    disableScrolling: function() {
      this.$el.addClass('no-scroll');
    },
    
    allowScrolling: function() {
      this.$el.removeClass('no-scroll');
    },
    
    events: {
      'click #animations-toggle': function() {
        this.$el.toggleClass('animated');
        this.closeSidebars();
        Settings.findWhere({ title: 'Animations' }).set('value', this.$el.hasClass('animated')).save();
      }
    }
  });
  
  return BookView;
});