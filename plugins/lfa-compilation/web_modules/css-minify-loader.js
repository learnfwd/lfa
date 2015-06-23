var CleanCSS = require('clean-css');

module.exports = function (content) {
  this.cacheable(true);
  var opts = {
    restructuring: false
  };
  return new CleanCSS(opts).minify(content).styles;
};
