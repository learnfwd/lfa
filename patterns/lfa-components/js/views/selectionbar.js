define([
  'jquery',
  'underscore',
  'backbone',
  'store',
  
  'rangytext'
], function($, _, Backbone, Store, rangy) {
  'use strict';
  
  var Highlight = Backbone.Model.extend({
    defaults: {
      chapter: '',
      value: ''
    }
  });
  
  var HighlightsCollection = Backbone.Collection.extend({
    model: Highlight,
    localStorage: new Store('lfa-highlights')
  });
  
  var Highlights = new HighlightsCollection();
  // Fetch from localStorage.
  Highlights.fetch();
  
  var SelectionbarView = Backbone.View.extend({
    initialize: function(options) {
      this.parent = options.parent;
      
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
      
      var localHighlights = Highlights.findWhere({ chapter: window.App.book.currentChapter });
      
      if (!localHighlights) {
        console.log('noep');
        var chapterDefault = new Highlight({ chapter: window.App.book.currentChapter, value: '' });
        Highlights.add(chapterDefault);
        chapterDefault.save();
      } else {
        var value = localHighlights.get('value');
        if (value !== '') {
          highlighter.deserialize(value);
        }
      }
      
      function highlightSelectedText() {
        highlighter.highlightSelection('highlight');
        
        var serializedHighlights = highlighter.serialize();
        
        localHighlights.set('value', serializedHighlights).save();
      }
      
      function noteSelectedText() {
        $('#selectionbar').addClass('add-note');
        highlighter.highlightSelection('note');
        
        $('#selectionbar .note-area').focus();
      }
      
      function removeHighlightFromSelectedText() {
        highlighter.unhighlightSelection();
        
        // localHighlights.set('value', '').save();
      }
      
      $('#selectionbar .highlight').on('mousedown touchstart', highlightSelectedText);
      $('#selectionbar .add-note').click(noteSelectedText);
      $('#selectionbar .remove-selection').click(removeHighlightFromSelectedText);
      
      $('#selectionbar .cancel-note, #selectionbar .confirm-note').click(function() {
        $('#selectionbar').removeClass('add-note');
      });
      
      $('#content').on('mouseup touchend', function() {
        if (window.getSelection().isCollapsed) {
          $('#selectionbar').removeClass('active add-note');
        } else {
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
    }
  });
  
  return SelectionbarView;
});