var assert = require('assert');
var uuid = require('node-uuid');
var _ = require('underscore');
var querystring = require('querystring');
var request = require('request');
var url = require('url');

var queryArgs = {
  v: 1
};

var serverConfig = {
  protocol : 'http:',
  host: 'www.google-analytics.com',
  pathname: 'collect'
};

function GoogleAnalytics(opts) {
  assert(typeof(opts) === 'object', 'Argument must be an object');
  assert(typeof(opts.tid) === 'string', 'Please set opts.tid to your UA Tracking ID');

  opts.cid = opts.cid || uuid.v4();

  this.args = opts;
}

GoogleAnalytics.prototype.send = function(hitType, args, cb) {
  if (typeof(hitType) === 'object') {
    cb = args;
    args = hitType;
  } else {
    args.t = hitType;
  }

  cb = cb || function () {};

  assert(typeof(args) === 'object', 'args must be an object');
  assert(typeof(args.t) === 'string', 'You must specify a hit type');
  assert(typeof(cb) === 'function', 'cb must be a function');

  var allArgs = _.extend({}, queryArgs, this.args, args);
  var headers = {};

  if (allArgs.userAgent) {
    headers['User-Agent'] = allArgs.userAgent;
    delete allArgs.userAgent;
  }

  if (allArgs.ip) {
    headers['X-Forwarded-For'] = allArgs.ip;
    delete allArgs.ip;
  }

  allArgs.z = uuid.v4();
  var search = querystring.stringify(allArgs);
  var uri = url.format(_.extend(serverConfig, { search: search }));
  request({
    uri: uri,
    headers: headers 
  }, cb);
};

GoogleAnalytics.prototype.trackEvent = function(category, action, label, value, args, cb) {
  assert(typeof(category) === 'string', 'category must be a string');
  assert(typeof(category) === 'string', 'action must be a string');

  if (typeof(label) !== 'string') {
    cb = args;
    args = value;
    value = label;
    label = undefined;
  }

  if (typeof(value) !== 'number') {
    cb = args;
    args = value;
    value = undefined;
  }

  if (typeof(args) !== 'object') {
    cb = args;
    args = {};
  }

  var eventArgs = {
    ec: category,
    ea: action,
  };

  if (label !== undefined) {
    eventArgs.el = label;
  }

  if (value !== undefined) {
    eventArgs.ev = value;
  }

  this.send('event', _.extend({}, args, eventArgs), cb);
};

module.exports = GoogleAnalytics;
