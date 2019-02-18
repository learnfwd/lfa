var path = require('path');
var fs = require('fs');
var uuid = require('uuid');
const gulpTemplate = require('gulp-template');

module.exports = function indexHtmlTasks(lfa) {
  lfa.task('html:files:index.html', function () {
    var template = path.join(__dirname, 'templates', 'index.html');
    var requireScript = path.join(__dirname, 'templates', 'lfa-require.js');
    this.addFileDependencies(template);
    this.addFileDependencies(requireScript);

    var currentBundle = lfa.currentCompile.bundleName;
    var debug = lfa.currentCompile.debug;

    var vendorCSS = [];
    var mainCSS = [];
    var js = [];

    lfa.config.externalPlugins.forEach(function (bundle) {
      vendorCSS.push(bundle + '-vendor.css');
      mainCSS.push(bundle + '-main.css');
      js.push(bundle + '.js');
    });

    js.push(currentBundle + '.js');
    if (!debug) {
      vendorCSS.push(currentBundle + '-vendor.css');
      mainCSS.push(currentBundle + '-main.css');
    }

    var data = {
      book: lfa.config.book,
      debug: debug,
      cacheBlob: uuid.v4(),
      serve: !!lfa.currentCompile.serve,
      watcher: lfa.currentCompile.watcher,
      currentBundle: currentBundle,
      vendorCSSFiles: vendorCSS,
      mainCSSFiles: mainCSS,
      jsFiles: js,
      requireScript: fs.readFileSync(requireScript, { encoding: 'utf-8' }),
    };

    return lfa.src(template)
      .pipe(gulpTemplate(data, { variable: 'obj' }));
  });
};
