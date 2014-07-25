var fs = require('fs');
var path = require('path');
var nodefn = require('when/node');
var when = require('when');
var mkdirp = require('mkdirp');

function WriteTask() {
  var self = this;
  if (!self.destPath) { return; }
  if (!self.stream && self.content === undefined) { return; }
  var outpath = path.join(self.project.config.outputDir, this.destPath);
  var dirname = path.dirname(outpath);
  console.log(outpath, dirname);
  return nodefn.call(mkdirp, dirname).then(function() {
    return when.promise(function(resolve, reject) {
      var outStream = fs.createWriteStream(outpath);
      outStream.on('error', function (err) {
        reject(err);
      });
      outStream.on('finish', function () {
        resolve();
      });

      if (self.stream) {
        self.stream.on('error', function (err) {
          reject(err);
        });
        self.stream.pipe(outStream);
      } else {
        outStream.end(self.content, 'utf8');
      }
    });
  });
}

module.exports = WriteTask;
