var projectMixinsModuleId = null;
try {
  projectMixinsModuleId = require.resolve('!!mixin-loader!__PROJ_PATH__/mixins/index.jade');
} catch (ex) {}

if (projectMixinsModuleId !== null) {
  __webpack_require__(projectMixinsModuleId);
}
