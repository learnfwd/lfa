var gulpJade = require('gulp-jade');
var path = require('path');

module.exports = function indexHtmlTasks(lfa) {
  lfa.task('html:files:index.html', function () {
    var template = path.join(__dirname, 'templates', 'index.jade');
    var opts = {
      locals: {
        book: lfa.config.book,
        serve: !!lfa.currentCompile.serve,
        watcher: lfa.currentCompile.watcher,
      },
    };

    return lfa.src(template)
      .pipe(gulpJade(opts));
  });
};
