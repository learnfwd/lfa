var CleanCSS = require('clean-css');

module.exports = function (content) {
  this.cacheable(true);
  return new CleanCSS().minify(content).styles;
};
