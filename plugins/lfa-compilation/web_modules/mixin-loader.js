var JadeFastCompiler = require('../lib/jade-fast-compiler');

module.exports = function (content) {
  this.cacheable(true);
  var next = this.async();

  var opts = { filename: this.resourcePath };

  JadeFastCompiler.compileBundle(content, opts)
    .then(function (bundle) {
      var newContent = [
        'var lfaMixins = window.lfaMixins = window.lfaMixins || [];\n',
        'var mixins = ', bundle, ';\n',
        'lfaMixins.push(mixins);\n',
        'module.exports = mixins;\n',
      ].join('');

      next(null, newContent);
    })
    .catch(function (err) {
      next(err);
    });
};
