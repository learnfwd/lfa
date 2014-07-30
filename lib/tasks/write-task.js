var fs = require('fs');
var path = require('path');
var nodefn = require('when/node');
var mkdirp = require('mkdirp');
require('../stream');

function WriteTask(stream) {
  var self = this;
  if (!self.destPath) { return; }
  var outpath = path.join(self.project.config.outputDir, this.destPath);
  var dirname = path.dirname(outpath);

  return nodefn.call(mkdirp, dirname).then(function() {
    return stream.pipeErr(fs.createWriteStream(outpath));
  });
}

module.exports = WriteTask;
