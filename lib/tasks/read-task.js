var fs = require('fs');

function ReadTask() {
  this.stream = fs.createReadStream(this.sourceFullPath);
  console.log(this.sourceFullPath);
}

module.exports = ReadTask;
