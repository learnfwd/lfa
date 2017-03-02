var path = require('path');

module.exports = function loadCssFiles(stylesPath, type, buf) {
  // All the different kinds of CSS lfa supports
  var requests = [
    path.join(stylesPath, type + '.css'), // CSS
    path.join(stylesPath, type + '.styl'), // Stylus
    path.join(stylesPath, type + '.scss'), // SCSS
    path.join(stylesPath, type + '.sass'), // SASS
    path.join(stylesPath, type + '.js'), // CSS-requiring JS 
  ];

  requests.forEach(function (request, idx) {
    buf.push('try { var modId');
    buf.push(idx);
    buf.push(' = require.resolve(');
    buf.push(JSON.stringify(request));
    buf.push('); } catch (ex) {}\n');
    buf.push('if (modId');
    buf.push(idx);
    buf.push(' !== undefined) { ');
    buf.push('__webpack_require__(modId');
    buf.push(idx);
    buf.push('); }\n');
  });
}