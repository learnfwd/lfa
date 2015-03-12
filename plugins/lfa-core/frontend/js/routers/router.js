var Backbone = require('backbone');

var App = require('../app');

var Router = Backbone.Router.extend({
  routes: {
    '': 'home',
    'book/:chapter(/:id)': 'book'
  },
  
  home: function () {
    console.log('home');
    App.book.showFirstChapter();
  },
  
  book: function(chapter, id) {
    App.book.show(chapter, id);
  }
});

module.exports = Router;
