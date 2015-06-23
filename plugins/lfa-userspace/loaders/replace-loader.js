var path = require('path');

module.exports = function (content) {
  this.cacheable(true);
  var lfa = this.options.lfa;
  var userJsPath = path.join(lfa.config.projectPath, 'js');
  return content.replace(/__REPLACE__/, userJsPath);
};
