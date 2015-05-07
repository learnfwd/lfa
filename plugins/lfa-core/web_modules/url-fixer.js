module.exports = function (content) {
  this.cacheable(true);
  return content.replace(/url\((\\?['"])?\.?\//g, 'url($1", window.location.origin, "/');
};
