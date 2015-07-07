var path = require('path');
var sep = path.sep.replace('\\', '\\\\');

module.exports = function (content) {
  this.cacheable(true);
  var projPath = this.options.lfa.config.projectPath.split(path.sep).join(sep);

  return content.replace(/('[^']*|"[^"]*)__PROJ_PATH__([^'"!]*)([^'"]*('|"))/, function (match, p1, p2, p3) {
    return p1 + projPath + p2.split('/').join(sep) + p3;
  });
};
