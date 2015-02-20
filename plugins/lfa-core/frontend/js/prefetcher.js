define(['templates', 'underscore'], function(Templates, _) {
  function Prefetcher() {
    this.cache = {};
    this.maxCacheLength = 64 * 1024; //128 kB
    this.cacheLength = 0;
    this.chapterPriority = [];
    this.priorityHash = {};
    this.cacheSize = {};
  }

  Prefetcher.prototype.chapterFinishedCaching = function(key, err, value) {
    if (err) {
      delete this.cache[key];
    } else {
      this.cache[key] = true;
      this.cacheSize[key] = value.length;
      this.cacheLength += value.length;
    }
    this.rebalanceCache();
  };

  Prefetcher.prototype.reclaimCache = function(tillPriority) {
    var hash = this.priorityHash;
    while (this.cacheLength > this.maxCacheLength) {
      var maxPri = -1;
      var maxCache = null;
      _.each(this.cache, function(value, key) {
        var pri = hash[key];
        if (pri > maxPri) {
          maxPri = pri;
          maxCache = key;
        }
      });
      if (maxPri <= tillPriority || !maxCache) { break; }
      this.cacheLength -= this.cacheSize[maxCache];
      Templates.removeLoaded(maxCache);
      delete this.cache[maxCache];
      delete this.cacheSize[maxCache];
    }
  };

  Prefetcher.prototype.rebalanceCache = function() {
    for (var i = 0, v = this.chapterPriority, n = v.length; i < n; i++) {
      var ch = v[i];
      var priority = this.priorityHash[ch];
      var cacheQ = this.cache[ch];
      if (cacheQ === 2) { return; } //loading
      if (!cacheQ) {
        this.reclaimCache(priority);
        if (this.cacheLength <= this.maxCacheLength) {
          this.cache[ch] = 2;
          Templates.asyncLoad(ch, this.chapterFinishedCaching.bind(this, ch));
        }
        return;
      }
    }
  };

  Prefetcher.prototype.setChapterPriority = function(priority) {
    this.chapterPriority = priority;
    var h = this.priorityHash = {};
    for (var i = 0, n = priority.length; i < n; i++) {
      h[priority[i]] = i;
    }
    this.rebalanceCache();
  };

  return Prefetcher;
});
