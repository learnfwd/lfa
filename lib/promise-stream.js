var futureStream = require('future-stream');

module.exports = function(promise) {
  var ready = false;
  var stream = null;
  promise.then(function(s) {
    stream = s;
    ready = true;
  });
  return futureStream(
    function() { return stream; },
    function() { return ready; }
    );
};
