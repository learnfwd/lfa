module.exports = {
  BuildInfo: require('build-info'),
  HotChapterReload: require('./hot-chapter-reload'),
  UserJS: require('!!../../loaders/replace-loader.js!./userjs.js'),
};
