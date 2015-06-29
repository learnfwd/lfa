var BuildInfo = require('lfa-book').BuildInfo;
var intercomAppId = 'hbrr4gpp';

function _boostrapIntercom() {
  //Beautified bootstrap code
  var w = window;
  var ic = w.Intercom;
  if (typeof ic === 'function') {
    ic('reattach_activator');
    ic('update', window.intercomSettings);
  } else {
    var d = document;
    var i = function() {
      i.c(arguments);
    };
    i.q = [];
    i.c = function(args) {
      i.q.push(args);
    };
    w.Intercom = i;

    var s = d.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = 'https://widget.intercom.io/widget/hbrr4gpp';
    var x = d.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(s, x);
  }
}

function IntercomAnalytics(manager) {
  if (manager.debug && BuildInfo.supportEmail) {
    _boostrapIntercom();
    window.Intercom('boot', {
      app_id: intercomAppId,
      email: BuildInfo.supportEmail,
    });
  }
}

IntercomAnalytics.prototype.trackEvent = function(manager, key, data) {
  //TO DO: Evented API
};

module.exports = IntercomAnalytics;
