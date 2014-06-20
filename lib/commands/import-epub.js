var epub = require('../epub_import');

function _importEpub(args) {
  if (args._.length < 2) {
    return console.error('make sure to pass me an epub to extract'.red);
  }
  if (args._.length < 3) {
    return console.error('make sure to pass a name for your project!'.red);
  }

  var from = args._[1];
  var to = args._[2];
  var opts = {
    copyUndeclared: args['copy-undeclared'],
    debug: args.debug,
  };

  epub.run(from, to, opts);
}

module.exports = { execute: _importEpub };
