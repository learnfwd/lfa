var utils = require('loader-utils');
var path = require('path');
var fs = require('fs');

// Pitching loader. Ignore everything after this loader
module.exports = function () {};

module.exports.pitch = function () {
  this.cacheable(true);
  var plugins = this.options.lfaPlugins;
  var dummyFile = this.options.dummyFile;
  var type = utils.getOptions(this).type;
  var debug = !!this.options.lfa.currentCompile.debug;
  var hasStylesTypeKey = (type === 'vendor' ? 'hasVendorStyles' : 'hasMainStyles');

  var buf = [];

  // if (!debug) {
    // buf.push('var buf = []\n');
  // }

  plugins.forEach(function (plugin, idx) {
    if (plugin.package.lfa.hasStyles === false) { return; }
    if (plugin.package.lfa[hasStylesTypeKey] === false) { return; }

    var pluginPath = path.join(plugin.path, 'frontend', 'styles');

    // All the different kinds of CSS lfa supports
    var requests = [
      path.join(pluginPath, type + '.css'), // CSS
      path.join(pluginPath, type + '.styl'), // Stylus
      path.join(pluginPath, type + '.scss'), // SCSS
      path.join(pluginPath, type + '.sass'), // SASS
      path.join(pluginPath, type + '.js'), // JS
    ];

    requests.forEach(function (request, idx) {
      if (fs.existsSync(request)) {
        console.log(request)
        buf.push('require(')
        buf.push(JSON.stringify(request));
        buf.push(');\n')
      }
      // buf.push('try { var modId');
      // buf.push(idx);
      // buf.push(' = require.resolve(');
      // buf.push('); } catch (ex) {}\n');
      // buf.push('if (modId');
      // buf.push(idx);
      // buf.push(' !== undefined) { ');
      // // if (!debug) { buf.push('buf.push('); }
      // buf.push('__webpack_require__(modId');
      // buf.push(idx);
      // // if (!debug) { buf.push(')'); }
      // buf.push('); }\n');
    });

    // var loaderRequest = 'plugin-css-loader?path=' + encodeURIComponent(pluginPath) + '&type=' + type;
    // var queryString = '!!' + loaderRequest + '!' + dummyFile;
    //
    // // buf.push('var mod');
    // // buf.push(idx);
    // // buf.push(' = require(');
    // buf.push('require(');
    // buf.push(JSON.stringify(queryString));
    // buf.push(');\n');
    // // if (!debug) {
    // //   buf.push('buf.push(mod');
    // //   buf.push(idx);
    // //   buf.push(');\n');
    // // }
  });
  //
  // if (!debug) {
  //   buf.push('var CleanCSS = require("clean-css");');
  //   buf.push('module.exports = new CleanCSS().minify(buf.join("")).styles');
  // }

  return buf.join('');
};

