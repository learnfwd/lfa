define([
  'jquery',
  'underscore',
  'backbone',
  'store',
  'hammer',
  'bootstrap',
  'stacktable',
  'nlform',
  'templates',
  'rangytext'
], function($, _, Backbone, Store, Hammer, Bootstrap, Stacktable, NLForm, Templates, rangy) {
  'use strict';
  
  var Highlight = Backbone.Model.extend({
    defaults: {
      chapter: '',
      value: ''
    },
    
    toggle: function () {
      this.save({
        completed: !this.get('value')
      });
    }
  });
  
  var HighlightsCollection = Backbone.Collection.extend({
    model: Highlight,
    localStorage: new Store('lfa-highlights')
  });
  
  var Highlights = new HighlightsCollection();
  // Fetch from localStorage.
  Highlights.fetch();
  
  var ChapterView = Backbone.View.extend({
    initialize: function(options) {
      this.parent = options.parent;
    },
    
    render: function(chapter) {
      this.$el.html(Templates[chapter]);
      
      window.App.book.trigger('render');
      
      // After the content loads, juice it up with some javascript.
      
      // TODO: refactor this into its own Backbone module.
      
      var highlighter;

      rangy.init();

      highlighter = rangy.createHighlighter();

      highlighter.addClassApplier(rangy.createCssClassApplier('highlight', {
        ignoreWhiteSpace: true,
        elementTagName: 'a',
        elementProperties: {
          href: '#',
          onclick: function() {
            var highlight = highlighter.getHighlightForElement(this);
            if (window.confirm('Delete this highlight?')) {
              highlighter.removeHighlights([highlight]);
            }
            return false;
          }
        }
      }));

      highlighter.addClassApplier(rangy.createCssClassApplier('note', {
        ignoreWhiteSpace: true,
        elementTagName: 'a',
        elementProperties: {
          href: '#',
          onclick: function() {
            var highlight = highlighter.getHighlightForElement(this);
            if (window.confirm('Delete this note?')) {
              highlighter.removeHighlights([highlight]);
            }
            return false;
          }
        }
      }));
      
      var localHighlights = Highlights.findWhere({ chapter: chapter });
      
      if (!localHighlights) {
        console.log('noep');
        var chapterDefault = new Highlight({ chapter: chapter, value: '' });
        Highlights.add(chapterDefault);
        chapterDefault.save();
      } else {
        var value = localHighlights.get('value');
        if (value !== '') {
          highlighter.deserialize(value);
        }
      }

      function highlightSelectedText(e) {
        highlighter.highlightSelection('highlight');
        
        var serializedHighlights = highlighter.serialize();
        
        localHighlights.set('value', serializedHighlights).save();
      }

      function noteSelectedText(e) {
        $('#selectionbar').addClass('add-note');
        highlighter.highlightSelection('note');
  
        $('#selectionbar .note-area').focus();
      }

      function removeHighlightFromSelectedText(e) {
        highlighter.unhighlightSelection();
      }

      $('#selectionbar .highlight').on('mousedown touchstart', highlightSelectedText);
      $('#selectionbar .add-note').click(noteSelectedText);
      $('#selectionbar .remove-selection').click(removeHighlightFromSelectedText);

      $('#selectionbar .cancel-note, #selectionbar .confirm-note').click(function(e) {
        $('#selectionbar').removeClass('add-note');
      });

      $('#content').on('mouseup touchend', function() {
        if (window.getSelection().isCollapsed) {
          $('#selectionbar').removeClass('active add-note');
        } else {
          var coords = window.getSelection().getRangeAt(0).getClientRects()[0];
    
          var ohboy = window.getSelection().getRangeAt(0).getClientRects()[0].top + $(window).scrollTop();
    
          if (window.innerWidth > 1199) {
      
            $('#selectionbar').css('top', ohboy - 30 + 'px');
          }
    
          $('#selectionbar').addClass('active');
        }
      });

      document.onselectionchange = function() {
        var selection = {};
        selection.base = window.getSelection().baseOffset;
        selection.extent = window.getSelection().extentOffset;
  
        if (selection.base === selection.extent && !$('#selectionbar').hasClass('add-note')) {
          $('#selectionbar').removeClass('active');
        }
      };
      
      // Enable responsive tables.
      this.$('table.table-responsive').stacktable({
        myClass: 'stacktable small-only'
      });
      
      // Enable fancy forms.
      this.$('form.fancy').each(function() {
        // TODO: fix this hack.
        $(this).prepend('<div class="nl-overlay"></div>');
        return new NLForm($(this)[0]);
      });
      
      // Enable Bootstrap popovers.
      this.$el.popover({
        selector: '[rel=popover]'
      });
      
      // Enable real parallax, fading modals and fading tab-panes on desktops.
      if (this.parent.html.hasClass('no-touch')) {
        this.$('.parallax').each(function() {
          var $bgobj, $window;
          $bgobj = $(this);
          $window = $(window);
          return $window.scroll(function() {
            var coords, yPos;
            yPos = -($window.scrollTop() / 10);
            coords = '100% ' + yPos + 'px';
            return $bgobj.css({
              backgroundPosition: coords
            });
          });
        });
        
        // TODO: fold these over to CSS under the body.animation class.
        this.$('.modal').each(function() {
          return $(this).addClass('fade');
        });
        
        this.$('.tab-pane').each(function() {
          return $(this).addClass('fade');
        });
      }
    }
  });
  
  return ChapterView;
});