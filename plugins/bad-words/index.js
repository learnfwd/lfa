var replace = require('gulp-replace');

module.exports = function (lfa) {
  lfa.task('html:filter:bad-words', function (input) {
    return input.pipe(replace(/Foo/, 'Bar'));
  });
};
