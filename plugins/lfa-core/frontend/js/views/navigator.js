var Backbone = require('backbone');
var App = require('lfa-core').App;

var info = require('lfa-book').BuildInfo.toc;
var sliderItems = [];

function addToSliderItems(item) {
  sliderItems.push(item.locals);
  if (item.children && item.children.length) {
    item.children.map(addToSliderItems);
  }
}

info.map(addToSliderItems);

var Slider = require('bootstrap-slider');

function tooltipFormatter(value) {
  var item = sliderItems[value - 1];
  var t = item.subtitle || '';

  if (t) {
    t = t.replace('Paginile ', '').trim();
    t += ' (' + item.title + ')';
  } else {
    t = item.title || '';
  }
  return t;
}

function newPage(value) {
  var item = sliderItems[value - 1];
  App.router.navigate('book/' + item.url, { trigger: true  });
}

var NavigationSliderView = Backbone.View.extend({
  initialize: function (options) {
    var self = this;
    self.parent = options.parent;
    self.items = sliderItems;
    var ticks = [];
    (function () { for (var i = 1; i <= self.items.length; i++) ticks.push(i);})();
    self.slider = new Slider('#navigator-slider-page', {
      tooltip: 'show',
      min: 1,
      ticks: ticks,
      max: self.items.length,
      formatter: tooltipFormatter,
    });

    self.parent.on('render', function (opts) {
      var ch = opts.chapter;
      var i = 0;
      for (i  = 0; i < self.items.length; i++) {
        if (self.items[i].url === ch) {
          self.slider.setValue(i + 1);
          return;
        }
        self.slider.setValue(0);
      }

    });

    self.slider.on('slideStop', newPage);
  },
});

module.exports = NavigationSliderView;
