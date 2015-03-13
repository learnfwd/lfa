var resolveMap = {};

function myRequire(mod) {
  return __webpack_require__(resolveMap[mod]);
}

window.require = myRequire;

myRequire.register = function register(name, moduleId) {
  resolveMap[name] = moduleId;
};

module.exports = myRequire;
