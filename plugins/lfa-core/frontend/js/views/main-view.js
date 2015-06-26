require('../modernizr-tests');
var Backbone = require('backbone');

var AppDispatcher = require('../app');
var Router = require('../routers/router');
var BookView = require('./book');
var $ = require('jquery');

var FastClick = require('fastclick');
require('bootstrap');

function MainView() {
  FastClick.attach(document.body);

  AppDispatcher.book = new BookView({ el: $('body') });
  AppDispatcher.router = new Router();

  AppDispatcher.book.once('render', function() {
    AppDispatcher.trigger('ready');
  });

  $(function () {
    Backbone.history.start();
  });
}

module.exports = MainView;
