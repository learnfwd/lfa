var vendor = require('!!simple-css-loader!css-minify!stylus-loader!stylus-entrypoints?key=vendor!./vendorcss.dummy');
var user = require('!!simple-css-loader!css-minify!stylus-loader!stylus-entrypoints?key=user!./usercss.dummy');

module.exports = vendor + user;
