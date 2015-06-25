require('!!../../loaders/replace-project-path.js!./mixins.js');

module.exports = {
  BuildInfo: require('build-info'),
  HotChapterReload: require('./hot-chapter-reload'),
  UserJS: require('!!../../loaders/replace-project-path.js!./userjs.js'),
};

console.log(module.exports);
