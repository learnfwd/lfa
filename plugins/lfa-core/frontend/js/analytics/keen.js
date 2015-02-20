define(['keen'], function (Keen) {
  var keenProjectId = '54e20112d2eaaa546e234ebe';
  var keenWriteKey = '5450b4ecc07551fd62dfc097d59dcf2c7d90d1990bbc633b08bf070d9fc293db6b9f29dc6a55d4ad0caef594de4d7bad33f8a7e01001f453ab483bcca4cf64491de7b93fba0533107aba6510a5eb043115506b264949e535160dd49ef29a2ac952ba2951a4a9fc9ff7460a9dc0b32358';

  function KeenAnalytics(manager) {
    this.keen = new Keen({
      projectId: keenProjectId,
      writeKey: keenWriteKey,
    });
  }

  KeenAnalytics.prototype.trackEvent = function(manager, key, data) {
    if (this.keen) {
      var keenEvent = {
        key: key,
        bookId: manager.bookId,
        userAgent: manager.userAgent,
        userAgentParsed: manager.userAgentParsed,
        title: manager.title,
        data: data,
        debug: manager.debug,
        sessionId: manager.sessionId,
        creatorId: manager.creatorId,
        keen: {
          timestamp: (new Date()).toISOString()
        }
      };
      this.keen.addEvent(key, keenEvent);
    }
  };

  return KeenAnalytics;
});
