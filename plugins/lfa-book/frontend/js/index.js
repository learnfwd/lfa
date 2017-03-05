// This is requried so that babel-preset-env can replace it with
// only the specific polyfills that are required
if (process.env.NODE_ENV === 'production') {
  require('babel-polyfill');
}

module.exports = {
  HotChapterReload: require('./hot-chapter-reload'),
  BuildInfo: require('build-info'),
  Chapters: require('./chapters')
};
