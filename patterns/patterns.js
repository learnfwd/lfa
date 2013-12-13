module.exports = function(opts) {
  var implicit = (opts && opts.implicit == false) ? false : true;

  return function(style){
    // include lfa-patterns
    style.include(__dirname);

    // implicit import handling
    if (implicit) style.import('lfa-patterns');
  }

}
