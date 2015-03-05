var Modernizr = require('modernizr');

// Add some custom Modernizr tests.
Modernizr.addTest('ipad', function () {
  return navigator.userAgent.match(/iPad/i);
});

Modernizr.addTest('iphone', function () {
  return navigator.userAgent.match(/iPhone/i);
});

Modernizr.addTest('ipod', function () {
  return navigator.userAgent.match(/iPod/i);
});

Modernizr.addTest('android', function () {
  return navigator.userAgent.match(/Android/i);
});

Modernizr.addTest('appleios', function () {
  return (Modernizr.ipad || Modernizr.ipod || Modernizr.iphone);
});

var ua = navigator.userAgent, r;
var verIE = null;
var isIE = (r = ua.match(/MSIE\s+([0-9]+)/)) || (ua.match(/Trident/) && (r = ua.match(/rv:([0-9]+)/)));
if (isIE) {
  if (r && r.length >= 2 && !isNaN(parseInt(r[1]))) {
    verIE = parseInt(r[1]);
  }
}

Modernizr.addTest('msie', function () {
  return isIE;
});

Modernizr.addTest('msie10', function () {
  return isIE && verIE === 10;
});

Modernizr.addTest('msie10p', function () {
  return isIE && verIE >= 10;
});

Modernizr.addTest('msie11', function () {
  return isIE && verIE === 11;
});

Modernizr.addTest('msie11p', function () {
  return isIE && verIE >= 11;
});

module.exports = Modernizr;
