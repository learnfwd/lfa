define(['underscore'], function (_) {
  var gaTrackingId = 'UA-44649809-4';

  function GoogleAnalytics(manager) {
    (function(i,s,o,g,r,a,m){i.GoogleAnalyticsObject=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    this.gaTrackerName = manager.bookId.replace(/[^a-zA-Z0-9]/, '') || 'lfaga';

    window.ga('create', {
      trackingId: gaTrackingId,
      name: this.gaTrackerName,
      cookieDomain: 'none',
    });
  }

  GoogleAnalytics.prototype.trackEvent = function(manager, key, data) {
    if (window.ga) {
      var d = manager.debug ? _.extend({ debug: true }, data) : data;
      window.ga(this.gaTrackerName + '.send', 'event', manager.bookId, key, JSON.stringify(d));
    }
  };

  return GoogleAnalytics;
});
