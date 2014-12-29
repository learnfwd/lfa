var concat = require('gulp-concat');
var stylusTasks = require('./stylus');
var indexHtmlTasks = require('./index-html');

module.exports = function coreTasks(lfa) {
  stylusTasks(lfa);
  indexHtmlTasks(lfa);

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
