var userModuleId = null;

try {
  var userModuleId = require.resolve('__PROJ_PATH__/js');
} catch (ex) {}

//This is here because legacy code requires book to be on App
require('lfa-core'); 

if (userModuleId !== null) {
  module.exports = __webpack_require__(userModuleId);
}
