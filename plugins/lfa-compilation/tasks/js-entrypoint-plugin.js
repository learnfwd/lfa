
function JSEntrypointPlugin(options) {
  this.options = options;
}

JSEntrypointPlugin.prototype.apply = function(compiler) {
  var plugins = this.options.lfaPlugins;
  var dummyFile = this.options.dummyFile;

  var buf = [];

  var amdExports = {};
  _.each(plugins, function (plugin) {
    var hasJS = (plugin.package.lfa.hasJS !== false);
    var hasMixins = (plugin.package.lfa.hasMixins !== false);

    if (!hasJS && !hasMixins) { return; }

    var loaderRequest = 'plugin-js-loader?path=' + encodeURIComponent(plugin.path) + '&js=' + hasJS + '&mixins=' + hasMixins;
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

  return buf.join('');
