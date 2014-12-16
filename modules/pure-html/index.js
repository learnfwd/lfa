module.exports = function (lfa) {
  lfa.task('html:compiler:html', function () {
    return lfa.src(lfa.projectPath + '/**/*.html');
  });
};
