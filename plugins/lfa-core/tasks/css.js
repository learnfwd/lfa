var concat = require('gulp-concat');
var stylusTasks = require('./css-stylus');

module.exports = function cssTasks(lfa) {
  stylusTasks(lfa);

  lfa.task('default:css', ['css:files:*'], function (cssFiles) {
    return cssFiles 
      .pipe(lfa.hook('css:filter:*'))
      .pipe(concat({ 
        base: '',
        path: 'main.css',
      }))
      .pipe(lfa.hook('css:pre-write:*'))
      .pipe(lfa.dst(lfa.config.buildPath))
      .pipe(lfa.hook('css:post-write:*'));
  });
};
