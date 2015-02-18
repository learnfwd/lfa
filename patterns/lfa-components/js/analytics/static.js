define([], function () {

  var domain = 'lfa-static.herokuapp.com';

  function StaticAnalytics() {
  }

  // AJAX implementation
  
  /* function sendAJAX(obj) {
    var url = 'http://' + domain + '/log';
    var xht = new XMLHttpRequest();
    xht.onerror = function() {};
    xht.open('POST', url, true);
    xht.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xht.setRequestHeader('Content-Type', 'application/json');
    xht.send(JSON.stringify(obj));
  } */


  // WebSockets implementation

  var ws = null;
  var messageQueue = [];
  var timerRunning = false;

  function sendWS(obj) {
    function sendQueue() {
      if (!messageQueue.length) { return; }
      if (!ws) { return; }
      if (ws.readyState === WebSocket.CONNECTING) { return; }
      if (ws.readyState !== WebSocket.OPEN) {
        reopenConnection();
        return;
      }
      for (var i = 0, n = messageQueue.length; i < n; i++) { 
        ws.send(JSON.stringify(messageQueue[i]));
      }
      messageQueue.length = 0;
    }

    function reopenConnection() {
      ws = null;
      if (messageQueue.length) {
        if (!timerRunning) {
          timerRunning = true;
          setTimeout(function() {
            setUpConnection();
            timerRunning = false;
          }, 10000);
        }
      }
    }

    function setUpConnection() {
      if (!ws) {
        ws = new WebSocket('wss://' + domain);
        ws.onopen = sendQueue;
        ws.onerror = reopenConnection;
      }
    }

    messageQueue.push(obj);
    setUpConnection();
    sendQueue();
  }

  StaticAnalytics.prototype.trackEvent = function(manager, key, data) {
    sendWS({
      version: 2,
      bookId: manager.bookId,
      userAgent: manager.userAgent,
      userAgentParsed: manager.userAgentParsed,
      title: manager.title,
      sessionId: manager.sessionId, 
      creatorId: manager.creatorId,
      clientTime: new Date(),
      key: key,
      debug: manager.debug,
      data: data,
    });
  };

  return StaticAnalytics;
});
