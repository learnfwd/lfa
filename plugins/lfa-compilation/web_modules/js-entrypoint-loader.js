var _ = require('lodash');

// Pitching loader. Ignore everything after this loader
module.exports = function () {};

module.exports.pitch = function () {
  this.cacheable(true);
  var plugins = this.options.lfaPlugins;
  var dummyFile = this.options.dummyFile;

  var buf = [];

  var amdExports = {};
  _.each(plugins, function (plugin) {
    var loaderRequest = 'plugin-js?path=' + encodeURIComponent(plugin.path);
    var queryString = '!!' + loaderRequest + '!' + dummyFile;
    amdExports[plugin.name] = {
      query: queryString,
      autorun: true,
    };

    var providedDeps = [];
    try { providedDeps = plugin.package.lfa.providedDependencies; } catch(ex) {}
    _.each(providedDeps, function (providedDep) {
      amdExports[providedDep] = {
        query: providedDep,
        autorun: false,
      };
    });
  });

  // Export the LFA modules
  _.each(amdExports, function(mod, moduleName) {
    buf.push('__lfa_define__(');
    buf.push(JSON.stringify(moduleName));
    buf.push(', function () {\n');
    buf.push('  return require(');
    buf.push(JSON.stringify(mod.query));
    buf.push(');\n}, ');
    buf.push(JSON.stringify(mod.autorun));
    buf.push(');\n');
  });

  // Run them
  //_.each(amdExports, function(queryString, moduleName) {
    //buf.push('require(');
    //buf.push(JSON.stringify(queryString));
    //buf.push(');\n');
  //});

  return buf.join('');
};

