var colors = require('colors');

var _help = function(){
  process.stdout.write(
    "\nNeed some help? Here's a list of all available commands (preceded by `lfa`):\n\n" +
    "- " + "new `name`: ".bold + "create a new textbook project\n" +
    "- " + "watch: ".bold + "watch your project, compile and reload whenever you save\n" +
    "- " + "compile: ".bold + "compile, compress, and minify to /public\n" +
    "- " + "serve: ".bold + "serves the content in /public without compile and reload on save\n" +
    "- " + "clean: ".bold + "delete the _build (or output_folder) in the current project\n" +
    "- " + "version: ".bold + "print the version of your current install\n" +
    "- " + "update: ".bold + "updates lfa through `npm update -g lfa`\n\n" +
    "- " + "create-custom-config: ".bold + "create a .lfarc file in your system root folder; you can use this file to specify system-wide lfa configuration variables\n\n" +
    ""
  );
};

module.exports = { execute: _help };
