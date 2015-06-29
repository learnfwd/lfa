var _ = require('lodash');
var BuildInfo = require('lfa-book').BuildInfo;

function Chapters() {
  var self = this;
  self.loadedChapters = {};
  self.existingChapters = {};
  _.each(BuildInfo.chapters, function (ch) {
    self.existingChapters[ch] = true;
  });

  window.registerChapter = function (json) {
    var chapter = json.chapter;
    var opts = self.loadedChapters[chapter];
    if (!opts) {
      self.loadedChapters[chapter] = opts = { callbacks: [] };
    }

    opts.loaded = true;
    opts.loading = false;
    opts.content = json.content;
    _.each(opts.callbacks, function (cb) { 
      cb(null, json.content);
    });
  };
}

Chapters.prototype.chapterExists = function(chapter) {
  return !!this.existingChapters[chapter];
};

Chapters.prototype.asyncLoad = function (chapter, cb) {
  if (!this.chapterExists(chapter)) {
    return cb(new Error('Chapter does not exist'));
  }

  var opts = this.loadedChapters[chapter];
  if (!opts) {
    this.loadedChapters[chapter] = opts = { callbacks: [] };
  }

  if (opts.loaded) {
    cb(null, opts.content);
  } else {
    opts.callbacks.push(cb);
    if (!opts.loading) {
      opts.loading = true;
      var script = window.document.createElement('script');
      script.src = 'chapters/' + chapter + '.js';
      opts.element = script;
      window.document.head.appendChild(script);
    }
  }
};

Chapters.prototype.removeLoaded = function (chapter) {
  var opts = this.loadedChapters[chapter];
  if (!opts) { return; }

  if (opts.loading) {
    _.each(opts.callbacks, function (cb) {
      cb(new Error('Loading cancelled'), null);
    });
  }
  if (opts.element) {
    window.document.head.removeChild(opts.element);
  }
  delete this.loadedChapters[chapter];
};

Chapters.prototype.chapterLoaded = function (chapter) {
  var opts = this.loadedChapters[chapter];
  return opts && opts.loaded;
};

module.exports = new Chapters();
