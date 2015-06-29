var path = require('path');

module.exports = function (content) {
  this.cacheable(true);
  var lfa = this.options.lfa;
  return content.replace(/__PROJ_PATH__/, lfa.config.projectPath);
};
