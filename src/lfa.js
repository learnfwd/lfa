var _ = require('lodash');
var path = require('path');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

function LFA(config) {
  if (typeof(config) !== 'object') {
    throw new Error('Private constructor. Use LFA.loadProject()');
  }
  this.path = path.resolve(__dirname, '..');
  this.config = config;
  this._initTasks();
}

util.inherits(LFA, EventEmitter);

_.extend(LFA.prototype, require('./tasks'));
_.extend(LFA.prototype, require('./compiler'));
_.extend(LFA.prototype, require('./watcher'));
_.extend(LFA.prototype, require('./events'));
_.extend(LFA, require('./cleaner'));
_.extend(LFA, require('./loader'));

module.exports = LFA;
