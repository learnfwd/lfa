//
// Patch streams so that they relay their errors downstream
// Much of this code is inspired from floatdrop/gulp-plumber
//

var EE = require('events').EventEmitter;

function patch(stream) {
  if (stream.pipe === pipe) {
    return stream;
  }

  stream._peOriginalPipe = stream._peOriginalPipe || stream.pipe;
  stream.pipe = pipe;

  return stream;
}

function pipe(dest) {
  if (!dest) {
    throw new Error('Can\'t pipe to undefined');
  }

  patch(dest);

  this.on('error', function (err) {
    dest.emit('error', err);
  });

  return this._peOriginalPipe.apply(this, arguments);
}

// Monkey-patch default ReadableStream object
patch.monkeyPatch = function () {
  var ReadableStream = require('stream').Readable;

  ReadableStream.prototype.pipeErrors = function pipeErrors() {
    patch(this);
    return this;
  };

  return this;
};

patch.patchFunction = function (f) {
  return function () {
    return patch(f.apply(this, arguments));
  };
};

module.exports = patch;

