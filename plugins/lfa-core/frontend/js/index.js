// Export require globally with limited access
var dynRequire = require('./dynamic-require');
dynRequire.register('jquery', require.resolve('jquery'));
dynRequire.register('lodash', require.resolve('lodash'));
dynRequire.register('underscore', require.resolve('lodash'));
dynRequire.register('lfa-core/app', require.resolve('lfa-core/app'));
dynRequire.register('app', require.resolve('lfa-core/app'));

// Bootstrap our app
var MainView = require('./views/main-view');
new MainView();
