(function () {
  window.__lfa_safe_eval__ = function safeEval(str) {
    eval(str);
  };
})();

(function () {
  // AJAX
  function makeRequest(url, cb) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState === XMLHttpRequest.DONE ) {
       if(xmlhttp.status === 200){
         cb(xmlhttp.responseText);
       }
      }
    };

    xmlhttp.open('GET', url, true);
    xmlhttp.send();
  }

  // Update system
  function runPatch() {
    var BuildInfo = require('lfa-book').BuildInfo;
    var Storage = require('lfa-core').Storage;
    var key = BuildInfo.version + ':patch';
    try {
      var val = Storage.getItem(key);
      if (val) {
        __lfa_safe_eval__(val);
      }
    } catch (ex) {}
  }

  function getPatchMeta() {
    var BuildInfo = require('lfa-book').BuildInfo;
    var Storage = require('lfa-core').Storage;
    var key = BuildInfo.version + ':patch-meta';
    try {
      return JSON.parse(Storage.getItem(key)) || {};
    } catch (ex) {}
    return {};
  }

  function setPatch(meta, patch) {
    var BuildInfo = require('lfa-book').BuildInfo;
    var Storage = require('lfa-core').Storage;
    var keyMeta = BuildInfo.version + ':patch-meta';
    var keyPatch = BuildInfo.version + ':patch';
    Storage.setItem(keyMeta, JSON.stringify(meta));
    Storage.setItem(keyPatch, patch);
  }

  function checkForUpdates() {
    var BuildInfo = require('lfa-book').BuildInfo;
    if (BuildInfo.patchServer) {
      var oldMeta = getPatchMeta();

      var uri = BuildInfo.patchServer + '?version=' + BuildInfo.version;
      uri += '&book=' + BuildInfo.bookId;
      if (oldMeta.version) {
        uri += '&patchVersion=' + oldMeta.version;
      }

      makeRequest(uri, function (rawData) {
        var d;
        try {
          var data = JSON.parse(rawData);
          if (typeof(data.patch) !== 'string' || typeof(data.meta) !== 'object') { return; }

          setPatch(data.meta, data.patch);
          d = data;
        } catch (ex) {}

        if (!d) { return; }
        if (d.meta.hot) {
          __lfa_safe_eval__(d.patch);
        } else {
          window.location.reload();
        }
      });
    }
  }

  // The module system
  var moduleCache = {};

  function define(mod, deps, cb, autorun, override) {
    if (!(deps instanceof Array)) {
      override = autorun; autorun = cb; cb = deps; deps = [];
    }
    if (!override && moduleCache[mod]) {
      console.warn('Module "' + mod + '"define()-d twice');
    }
    moduleCache[mod] = { 
      autorun: !!autorun,
      cb: cb, 
      deps: deps,
      hasRun: false,
      result: undefined,
    };
  }

  function override(mod, deps, cb, autorun) {
    define(mod, deps, cb, autorun, true);
  }

  function require(mod) {
    var cacheEntry = moduleCache[mod];
    if (!cacheEntry) {
      throw new Error('Module not found "' + mod + '"');
    }
    if (cacheEntry.hasRun) {
      return cacheEntry.result;
    }
    cacheEntry.hasRun = true;
    var resolvedDeps = [];
    cacheEntry.deps.forEach(function (dep) {
      resolvedDeps.push(require(dep));
    });
    return cacheEntry.result = cacheEntry.cb.apply(window, resolvedDeps);
  }

  function autorun() {
    for (var mod in moduleCache) {
      if (moduleCache[mod].autorun) {
        require(mod);
      }
    }
  }

  window.__lfa_autorun__ = autorun;
  window.__lfa_require__ = require;
  window.__lfa_define__ = define;
  window.__lfa_override__ = override;
  window.__lfa_check_patches__ = function () {
    runPatch();
    checkForUpdates();
  };

  window.require = require;
  window.define = define;
})();
