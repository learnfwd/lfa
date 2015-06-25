var utils = require('loader-utils');
var path = require('path');

// Pitching loader. Ignore everything after this loader
module.exports = function () {};

module.exports.pitch = function () {
  this.cacheable(true);
  var query = utils.parseQuery(this.query);
  var stylesPath = query.path;
  var type = query.type;

  // All the different kinds of CSS lfa supports
  var requests = [
    '!!simple-css-loader!stylus-loader!' + path.join(stylesPath, type + '.styl'), // Stylus
    '!!simple-css-loader!' + path.join(stylesPath, type + '.css'), // CSS
    path.join(stylesPath, type + '.js'), // CSS-exporting JS
  ];

  var buf = ['var buf = []\n'];

  requests.forEach(function (request, idx) {
    buf.push('try { var modId');
    buf.push(idx);
    buf.push(' = require.resolve(');
    buf.push(JSON.stringify(request));
    buf.push('); } catch (ex) {}\n');
    buf.push('if (modId');
    buf.push(idx);
    buf.push(' !== undefined) { buf.push(__webpack_require__(modId'); 
    buf.push(idx);
    buf.push(')); }\n');
  });

  buf.push('module.exports = buf.join("");\n');

  return buf.join('');
};

