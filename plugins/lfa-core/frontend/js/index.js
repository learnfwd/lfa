// Export require globally with limited access
var resolveMap = {
  'jquery': require.resolve('jquery'),
  'lodash': require.resolve('lodash'),
  'lfa-core/app': require.resolve('lfa-core/app'),
  'app': require.resolve('lfa-core/app'),
};

window.require = function (mod) {
  return __webpack_require__(resolveMap[mod]);
};

// Bootstrap our app
var MainView = require('./views/main-view');
new MainView();
