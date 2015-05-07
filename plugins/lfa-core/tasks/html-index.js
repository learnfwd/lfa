var gulpJade = require('gulp-jade');
var path = require('path');
var uuid = require('uuid');

module.exports = function indexHtmlTasks(lfa) {
  lfa.task('html:files:index.html', function () {
    var template = path.join(__dirname, 'templates', 'index.jade');
    this.addFileDependencies(template);
    var opts = {
      locals: {
        book: lfa.config.book,
        debug: lfa.currentCompile.debug,
        cacheBlob: uuid.v4(),
        serve: !!lfa.currentCompile.serve,
        watcher: lfa.currentCompile.watcher,
      },
    };

    return lfa.src(template)
      .pipe(gulpJade(opts));
  });
};
