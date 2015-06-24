var userModuleId = null;

try {
  var userModuleId = require.resolve('__PROJ_PATH__/js');
} catch (ex) {}

if (userModuleId !== null) {
  module.exports = __webpack_require__(userModuleId);
}
