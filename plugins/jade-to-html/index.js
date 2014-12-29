var jade = require('gulp-jade');

module.exports = function (lfa) {
  lfa.task('html:compiler:jade', function () {
    return lfa.src(lfa.projectPath + '/**/*.jade')
      .pipe(jade({
        pretty: true,
      }));
  });
};
