module.exports = function (f) {
  var x;
  eval('x = ' + f);
  return x;
};
