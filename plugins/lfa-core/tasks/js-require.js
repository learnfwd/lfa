var rename = require('gulp-rename');
var path = require('path');
var through = require('through2');
var File = require('vinyl');

module.exports = function requireJSTasks(lfa) {
  var config = lfa.config;

  lfa.task('js:files:requirejs', ['requirejs:files:*'], function (jsFiles) {
    return jsFiles;
  });

  // Copy core lfa JS files
  lfa.task('requirejs:files:lfa', function () {
    var jsPath = path.resolve(__dirname, '..', 'frontend', 'js') + path.sep + '**';
    var jsBase = path.resolve(__dirname, '..', 'frontend');
    return lfa.src(jsPath, { base: jsBase })
      .pipe(rename(function (p) {
        p.dirname = 'lfa' + path.sep + p.dirname;
      }));
  });

  // If the project doesn't have a main.js, we'll create one
  lfa.task('requirejs:files:main-shim', ['requirejs:files:main'], function (mainJs) {
    var stream = through.obj();
    var hasMain = false;
    var mainPath = path.resolve(config.projectPath, 'js', 'main.js');

    mainJs.pipe(through.obj(function (file, enc, cb) {
      if (file.path === mainPath) {
        hasMain = true;
      }
      cb();
    }));

    mainJs.on('end', function () {
      if (!hasMain) {
        stream.write(new File({
          base: config.projectPath,
          path: mainPath,
          contents: new Buffer('// This is here so RequireJS won\'t complain\n'),
        }));
        stream.end();
      }
    });

    return stream;
  });

  // Copy project JS files
  lfa.task('requirejs:files:main', function () {
    var jsPath = path.join(config.projectPath, 'js',  '**');
    var jsBase = config.projectPath;
    return lfa.src(jsPath, { base: jsBase });
  });
};
