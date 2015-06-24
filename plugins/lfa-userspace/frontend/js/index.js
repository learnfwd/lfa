require('!!../../loaders/replace-project-path.js!./mixins.js');
require('!!mixin-loader!../mixins/index.jade');

module.exports = {
  BuildInfo: require('build-info'),
  HotChapterReload: require('./hot-chapter-reload'),
  UserJS: require('!!../../loaders/replace-project-path.js!./userjs.js'),
};

console.log(module.exports);
