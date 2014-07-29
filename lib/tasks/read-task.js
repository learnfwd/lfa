var fs = require('fs');

function ReadTask() {
  if (!this.sourceFullPath) {
    return null;
  }
  return fs.createReadStream(this.sourceFullPath);
}

module.exports = ReadTask;
