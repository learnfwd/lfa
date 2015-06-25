var utils = require('loader-utils');
var path = require('path');

// Pitching loader. Ignore everything after this loader
module.exports = function () {};

module.exports.pitch = function () {
  this.cacheable(true);
  var query = utils.parseQuery(this.query);
  var stylesPath = query.path;
  var type = query.type;
  var debug = !!this.options.lfa.currentCompile.debug;

  // All the different kinds of CSS lfa supports
  var requests = [
    'raw-loader!' + path.join(stylesPath, type + '.css'), // CSS
    'raw-loader!stylus-loader!' + path.join(stylesPath, type + '.styl'), // Stylus
    'raw-loader!sass-loader!' + path.join(stylesPath, type + '.scss'), // SCSS
    'raw-loader!sass-loader?indentedSyntax!' + path.join(stylesPath, type + '.sass'), // SASS
    path.join(stylesPath, type + '.js'), // CSS-exporting JS
  ];

  var buf = debug ? [] : ['var buf = []\n'];

  requests.forEach(function (request, idx) {
    buf.push('try { var modId');
    buf.push(idx);
    buf.push(' = require.resolve(');
    buf.push(JSON.stringify('!!' + (debug ? 'style-loader!' : '' ) + request));
    buf.push('); } catch (ex) {}\n');
    buf.push('if (modId');
    buf.push(idx);
    buf.push(' !== undefined) { ');
    if (!debug) { buf.push('buf.push('); }
    buf.push('__webpack_require__(modId'); 
    buf.push(idx);
    if (!debug) { buf.push(')'); }
    buf.push('); }\n');
  });

  if (!debug) {
    buf.push('module.exports = buf.join("");\n');
  }

  return buf.join('');
};

