module.exports = function (content) {
  this.cacheable(true);
  return content.replace(/url\(((\\?['"])?)([^\)]+)\1\)/g, function (match, sep, p2, url) {
      if (/^\/\//.test(url)) {
        url = '", window.location.protocol, "' + url;
      } else if (!/:\/\//.test(url)) {
        url = '", window.location.origin, "/' + url;
      }
      return 'url(' + sep + url + sep + ')';
  });
};
