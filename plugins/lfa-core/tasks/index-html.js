var gulpJade = require('gulp-jade');
var through2 = require('through2');
var path = require('path');

module.exports = function indexHtmlTasks(lfa) {
  lfa.task('html:compiler:index.html', function () {
    var template = path.join(__dirname, 'templates', 'index.jade');
    var opts = {
      locals: {
        title: 'A Title',
        description: 'A description',
        keywords: ['some', 'keywords'],
      },
    };

    return lfa.src(template)
      .pipe(gulpJade(opts));
  });
};
