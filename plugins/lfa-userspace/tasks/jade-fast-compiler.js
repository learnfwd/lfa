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

JadeFastCompiler.compileFrontMatter = function compileFrontMatter(file, opts) {
  return nodefn.call(fs.readFile, file)
    .then(function (contents) {
      opts = opts || {};
      opts.self = true; //Simplifies the Jade output
      opts.filename = file;
      // Prevent the Jade compiler from optimizing out unused mixins
      contents += '\nmixin dynamic_dummy\n  - var nop;\n\n+#{"dynamic_dummy"}';
      return jadeCompiler.compileClient(contents, opts);
    })
    .then(function(res) {
      return extractMixins(res.result);
    });
};

JadeFastCompiler.compile = function compileFile(contents, matter, opts) {
  opts = opts || {};
  opts.self = true;

  return jadeCompiler.compileClient(contents, opts)
      .then(function (res) {
        var template = _.flatten([
            'result = (function template(locals) {',
            'var buf = [];',
            'var jade_mixins = {};',
            'var jade_interp;',
            'var self = locals || {};',
            matter,
            extractMixins(res.result),
            'return buf.join("");',
            '})'
          ]).join('\n');

        var result;
        eval(template);
        return result;
      });
};

module.exports = JadeFastCompiler;
