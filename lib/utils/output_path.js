var path = require('path');
var adapters = require('../adapters');

// takes a path from a lfa project and outputs the path
// that it will compile to.

module.exports = function(file){
  var extension = path.basename(file).split('.')[1]; // this should take the *first* extension only

  // dump views/assets to public
  var result = path.join(file.replace(process.cwd(), global.options.output_folder));

  // swap extension if needed
  if (adapters[extension]) {
    result = result.replace(new RegExp('\\.' + extension + '.*'), '.' + adapters[extension].settings.target);
  }

  return path.join(process.cwd(), result);
};
