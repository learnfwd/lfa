var concat = require('gulp-concat');

module.exports = function coreTasks(lfa) {
  require('./stylus')(lfa);
  var config = lfa.config;

  lfa.task('default:css', ['css:compiler:*'], function (cssFiles) {
    return cssFiles 
      .pipe(lfa.hook('css:filter:*'))
      .pipe(concat({ 
        base: '',
        path: 'main.css',
      }))
      .pipe(lfa.hook('css:pre-write:*'))
      .pipe(lfa.dst(config.buildPath));
  });

  lfa.task('default', ['default:*'], function (deps) {
    return deps;
  });
};
