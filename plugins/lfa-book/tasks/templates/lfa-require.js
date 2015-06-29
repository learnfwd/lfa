(function () {
  var moduleCache = {};

  function define(mod, deps, cb, autorun) {
    if (!(deps instanceof Array)) {
      autorun = cb; cb = deps; deps = [];
    }
    if (moduleCache[mod]) {
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
  window.require = require;
  window.define = define;
})();
