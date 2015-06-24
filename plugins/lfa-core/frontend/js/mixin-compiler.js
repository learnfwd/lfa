var jadeRuntime = require('jade/lib/runtime');
var _ = require('lodash');

var jadeContext = null;

function buildContext() {
  jadeContext = {
    jade: jadeRuntime,
  };

  _.each(window.lfaMixins || [], function (mixins) {
    mixins(jadeContext, false, false);
  });
}

module.exports = function (template) {
  try {
    if (!jadeContext) {
      buildContext();
    }

    return template(jadeContext);
  } catch (ex) {
    var trace = ex.stack || ex.toString();
    return [
      '<div class=".jade-error">',
        '<h2 class=".jade-error-title">',
          'Chapter loading error',
        '</h2>',
        '<pre class=".jade-error-trace">',
          trace,
        '</pre>',
      '</div>',
    ].join('');
  }
};
