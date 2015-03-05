var mixpanelProjectId = 'e7664e8400838d8c8f6dccca9302494f';

function _boostrapMixpanel() {
  var protocol = window.location.protocol === 'file:' ? 'http:' : '';
  (function(f,b){if(!b.__SV){var a,e,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.track_charge people.clear_charges people.delete_user".split(" ");
  for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d])};b.__SV=1.2;a=f.createElement("script");a.type="text/javascript";a.async=!0;a.src=protocol + "//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";e=f.getElementsByTagName("script")[0];e.parentNode.insertBefore(a,e)}})(document,window.mixpanel||[]);
}

function MixpanelAnalytics(manager) {
  _boostrapMixpanel();
  window.mixpanel.init(mixpanelProjectId);
  window.mixpanel.identify(manager.sessionId);
}

function _flatten(ob) {
  var toReturn = {};
  
  for (var i in ob) {
    if (!ob.hasOwnProperty(i)) {
      continue;
    }
    
    if ((typeof ob[i]) === 'object') {
      var flatObject = _flatten(ob[i]);
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) {
          continue;
        }
        toReturn[i + '.' + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
}

MixpanelAnalytics.prototype.trackEvent = function(manager, key, data) {
  if (window.mixpanel) {
    var mixpanelEvent = _flatten({
      key: key,
      bookId: manager.bookId,
      userAgent: manager.userAgent,
      userAgentParsed: manager.userAgentParsed,
      title: manager.title,
      data: data,
      debug: manager.debug,
      creatorId: manager.creatorId,
      distinct_id: manager.sessionId,
    });
    window.mixpanel.track(key, mixpanelEvent);
  }
};

module.exports = MixpanelAnalytics;
