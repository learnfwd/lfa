var resolveMap = {};

function myRequire(mod) {
  var moduleId = resolveMap[mod];
  if (moduleId === undefined) {
    throw new Error('Module "' + mod + '" is not available at window.require()');
  }
  return __webpack_require__(moduleId);
}

window.require = myRequire;

myRequire.register = function register(name, moduleId) {
  resolveMap[name] = moduleId;
};

module.exports = myRequire;
