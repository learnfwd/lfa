var LFA = require('./src/lfa');
var lfa = new LFA('./input', './output');

//TO DO: load these from package.json or something
require('./modules/lfa-core')(lfa);
require('./modules/bad-words')(lfa);
require('./modules/jade-to-html')(lfa);
require('./modules/pure-html')(lfa);

lfa.start('default');
