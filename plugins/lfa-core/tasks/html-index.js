var gulpJade = require('gulp-jade');
var path = require('path');
var uuid = require('uuid');
var _ = require('lodash');

module.exports = function indexHtmlTasks(lfa) {
  lfa.task('html:files:index.html', function () {
    var template = path.join(__dirname, 'templates', 'index.jade');
    this.addFileDependencies(template);

    var currentBundle = lfa.currentCompile.bundleName;
    var debug = lfa.currentCompile.debug;

    var vendorCSS = [];
    var mainCSS = [];
    var js = [];

    _.each(lfa.config.externalPlugins, function (bundle) {
      vendorCSS.push(bundle + '-vendor.css');
      mainCSS.push(bundle + '-main.css');
      js.push(bundle + '.js');
    });

    js.push(currentBundle + '.js');
    if (!debug) {
      vendorCSS.push(currentBundle + '-vendor.css');
      mainCSS.push(currentBundle + '-main.css');
    }

    var opts = {
      locals: {
        book: lfa.config.book,
        debug: debug,
        cacheBlob: uuid.v4(),
        serve: !!lfa.currentCompile.serve,
        watcher: lfa.currentCompile.watcher,
        currentBundle: currentBundle,
        vendorCSSFiles: vendorCSS,
        mainCSSFiles: mainCSS,
        jsFiles: js,
      },
    };

    return lfa.src(template)
      .pipe(gulpJade(opts));
  });
};
