var userModuleId = null;

try {
  var userModuleId = resolve('__REPLACE__');
} catch (ex) {}

if (userModuleId !== null) {
  __webpack_require__(userModuleId);
}
