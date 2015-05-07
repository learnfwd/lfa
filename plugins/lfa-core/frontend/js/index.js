// Export require globally with limited access
var dynRequire = require('./dynamic-require');
dynRequire.register('jquery', require.resolve('jquery'));
dynRequire.register('lodash', require.resolve('lodash'));
dynRequire.register('underscore', require.resolve('lodash'));
dynRequire.register('lfa-core/app', require.resolve('lfa-core/app'));
dynRequire.register('app', require.resolve('lfa-core/app'));

// Load CSS
// Notice the lack of css-loader. We don't want our resources to be require()'d
require('!!style-loader!simple-css-loader!stylus-loader!stylus-entrypoints?key=vendor!./dummy.styl');
require('!!style-loader!simple-css-loader!stylus-loader!stylus-entrypoints?key=user!./dummy.styl');

// Bootstrap our app
var MainView = require('./views/main-view');
new MainView();
