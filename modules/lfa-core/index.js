module.exports = function (lfa) {
  lfa.task('default:html', ['html:compiler:*'], function (htmlFiles) {
    return htmlFiles
      .pipe(lfa.hook('html:filter:*'))
      .pipe(lfa.dest(lfa.outputPath));
  });

  lfa.task('default', ['default:*'], function (deps) {
    return deps;
  });
};
