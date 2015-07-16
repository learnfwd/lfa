var jadeCompiler = require('accord').load('jade');
var _ = require('lodash');
var fs = require('fs');
var nodefn = require('when/node');
var jade = require('jade/lib/runtime');

var JadeFastCompiler = {};

function extractMixins(r) {
  // Extract the content of the template function
  return r.replace(/^[^]*var self = locals \|\| {};([^]*)return buf\.join\(""\)[^]*$/, '$1');
}

JadeFastCompiler.newContext = function newContext() {
  return {
    jade: jade,
  };
};

JadeFastCompiler.shimmedContext = function shimmedContext() {
  var ctx = JadeFastCompiler.newContext();
  // ctx.jade_mixins = new Proxy(...)
  return ctx;
};

JadeFastCompiler.extensibleBundle = function extensibleBundle(code) {
  var template = [
    '(function template(context, locals, use_buf) {',
      'var buf = context.buf = context.buf || [];',
      'buf.length = 0;',
      'var jade = context.jade;',
      'var jade_mixins = context.jade_mixins = context.jade_mixins || {};',
      'jade_mixins.dynamic_dummy = function () { return ""; };',
      'var jade_interp;',
      'context.self = ((locals === false) ? context.self : locals) || {};',
      code.replace(/self/g, 'context.self'),
      'if (use_buf !== false) { return buf.join(""); }',
    '})'
  ].join('\n');
  return template;
};

JadeFastCompiler.compileBundle = function compileBundle(contents, opts) {
  opts = opts || {};
  opts.self = true;

  // Prevent the Jade compiler from optimizing out unused mixins
  contents += '\n+#{"dynamic_dummy"}';

  return jadeCompiler.compileClient(contents, opts)
    .then(function (res) {
      return JadeFastCompiler.extensibleBundle(extractMixins(res.result));
    });
};

module.exports = JadeFastCompiler;
