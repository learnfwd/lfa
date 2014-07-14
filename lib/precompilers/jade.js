var jade = require('jade'),
    compressor = require('../utils/compressor'),
    fs = require('fs'),
    path = require('path'),
    jade_helpers = require('../../patterns/lfa-components/js/lib/jade-helpers');

exports.settings = {
  file_type: 'jade',
  target: 'js'
};

exports.init = function(buf) {
  buf.push('  window.jade = require(\'lfa/js/lib/jade-helpers.js\');\n');
  if (global.options.mixins) {
    initMixins();
    buf.push('  window.jade_mixins = require(\'js/templates/mixins.js\');\n');
  }
};

// this function will parse a target jade file and send it a dummy variable.
// inside this dummy variable, mixins can add their own variables by using
// the "locals" object
exports.call = function(jade_code, locals) {
  global.jade_helpers = jade_helpers;
  global.window = undefined;
  
  jade_code = jade_code.replace('var self = locals || {};', 'var self = null;');
  var mix = global.options.compiled_mixins;
  if (!mix) { mix = ''; }
  jade_code = jade_code.replace('window.buf = [];' ,'var buf = [];\nvar jade_mixins = {};\n' + mix);

  var jade_f = eval('(function(){var jade=global.jade_helpers;return ' + jade_code + ';})')();
  return jade_f.call(null, locals);
};

exports.compile = function(fileName, data, precompiler) {
  var compileOptions = {
    compileDebug: precompiler.debug || false,
    inline: precompiler.inline || false,
    self: true,
    pretty: false,
    filename: fileName,
    basedir: process.cwd()
  };
  
  data = jade.compileClient(data, compileOptions);

  // jade_mixins and buf are declared in window, so keep calm
  data = (data + '')
    .replace(/\nvar jade_mixins = {};\n/, '')
    .replace('var buf = [];', 'window.buf = [];');

  return data;
};

var initMixins = function() {
  // compile the mixins and remove some needless boilerplate
  var mixins = jade.compileClient(global.options.mixins, { 
    basedir: process.cwd(),
    filename: global.options.mixins_file
  })
    .replace(';;return buf.join("");\n}', ';\n')
    .replace('function template(locals) {\nvar buf = [];\nvar jade_mixins = {};\n', '')
    .replace(/var locals.*/, '');
  
  var buf = 'define(function() {\n  var jade_mixins = {};' + mixins + '  return jade_mixins;\n});';
  
  if (global.options.compress) {
    buf = compressor(buf, 'js');
  }

  global.options.compiled_mixins = mixins;
  
  fs.writeFileSync(path.join(process.cwd(), global.options.output_folder, 'js', 'templates', 'mixins.js'), buf);
};
