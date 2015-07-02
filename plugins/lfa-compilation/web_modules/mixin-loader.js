var JadeFastCompiler = require('../lib/jade-fast-compiler');

module.exports = function (content) {
  this.cacheable(true);
  var next = this.async();

  var opts = { filename: this.resourcePath };

  JadeFastCompiler.compileBundle(content, opts)
    .then(function (bundle) {
      var newContent = [
        'module.exports = ', bundle, ';\n',
        'window.lfaMixins = window.lfaMixins || [];\n',
        'window.lfaMixins.push(module.exports);\n',
      ].join('');

      next(null, newContent);
    })
    .catch(function (err) {
      next(err);
    });
};
