var BuildInfo = require('build-info');
var mixinCompiler = require('./mixin-compiler');

function Chapters() {
  var self = this;
  self.loadedChapters = {};
  self.existingChapters = {};
  BuildInfo.chapters.forEach(function (ch) {
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
    opts.content = function () { return mixinCompiler(json.content); };
    if (opts.element) {
      window.document.head.removeChild(opts.element);
      opts.element = null;
    }
    opts.callbacks.forEach(function (cb) { 
      cb(null, opts.content);
    });
  };
}

Chapters.prototype.chapterExists = function(chapter) {
  return !!this.existingChapters[chapter];
};

Chapters.prototype.loadChapter = function (chapter, cb) {
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

Chapters.prototype.removeLoadedChapter = function (chapter) {
  var opts = this.loadedChapters[chapter];
  if (!opts) { return; }

  if (opts.loading) {
    opts.callbacks.forEach(function (cb) {
      cb(new Error('Loading cancelled'), null);
    });
  }
  if (opts.element) {
    window.document.head.removeChild(opts.element);
  }
  delete this.loadedChapters[chapter];
};

Chapters.prototype.isChapterLoaded = function (chapter) {
  var opts = this.loadedChapters[chapter];
  return opts && opts.loaded;
};

module.exports = new Chapters();
