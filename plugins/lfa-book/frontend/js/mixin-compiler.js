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
  if (!jadeContext) {
    buildContext();
  }

  return template(jadeContext);
};
