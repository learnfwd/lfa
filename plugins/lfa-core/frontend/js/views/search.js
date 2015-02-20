define([
  'jquery',
  'underscore',
  'backbone',
  'templates',
  'queryengine',
  'searchjson'
], function($, _, Backbone, Templates, QueryEngine, SearchJSON) {
  'use strict';
  
  var Pages = QueryEngine.createLiveCollection(SearchJSON.pages),
      Search = Pages.createLiveChildCollection()
    .setFilter('search', function(model, searchString) {
      var pass = true, searchRegex, searchTerms = searchString.split(/\s+/);
      if (searchString) {
        for (var i = 0, len = searchTerms.length; i < len && pass; i++) {
          searchRegex = QueryEngine.createSafeRegex(searchTerms[i]);
          pass = pass && (searchRegex.test(model.get('body')) || searchRegex.test(model.get('title')));
        }
      }
      return pass;
    });
  
  var SearchView = Backbone.View.extend({
    initialize: function(options) {
      this.parent = options.parent;
      
      this.search = this.$('input.search');
      this.eraseBtn = this.$('#search-erase');
      this.goBtn = this.$('#search-go');
      this.results = this.$('#search-results');
      
      this.query = '';
    },
    
    showEraser: function() {
      this.eraseBtn.removeClass('concealed');
      this.goBtn.addClass('concealed');
    },
    
    hideEraser: function() {
      this.eraseBtn.addClass('concealed');
      this.goBtn.removeClass('concealed');
    },
    
    eraseQuery: function() {
      this.setQuery('');
      this.search.val('');
    },
    
    setQuery: function(query) {
      this.query = query;
      
      if (this.query.length) {
        this.showEraser();
      } else if (!this.query.length) {
        this.hideEraser();
      }
      
      if (this.query.length >= 3) {
        var results = Search.setSearchString(this.query).query().models,
            maxResults = 5;

        var buf = '';
        for (var i = 0, len = results.length; i < len && i < maxResults; i++) {
          buf += Templates['search_result'](results[i].attributes);
        }
        this.results.html(buf);
      } else {
        this.results.html('');
      }
    },
    
    events: {
      'input input.search': function() {
        this.setQuery(this.search.val());
      },
      'click #search-erase:not(.concealed)': function() {
        this.eraseQuery();
      }
    }
  });
  
  return SearchView;
});