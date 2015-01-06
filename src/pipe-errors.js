//
// Patch streams so that they relay their errors downstream
// Much of this code is inspired from floatdrop/gulp-plumber
//

var EE = require('events').EventEmitter;

function removeDefaultHandler(stream, event) {
  var found = false;
  stream.listeners(event).forEach(function (item) {
    if (item.name === 'on' + event) {
      found = item;
      this.removeListener(event, item);
    }
  }, stream);
  return found;
}

function wrapPanicOnErrorHandler(stream) {
  var oldHandler = removeDefaultHandler(stream, 'error');
  if (oldHandler) {
    stream.on('error', function onerror2(er) {
      if (EE.listenerCount(stream, 'error') === 1) {
        this.removeListener('error', onerror2);
        oldHandler.call(stream, er);
      }
    });
  }
}

function patchPipe(stream) {
  // Prevent unpipe on error
  wrapPanicOnErrorHandler(stream, 'error');

  stream._peOriginalPipe = stream._peOriginalPipe || stream.pipe;
  stream.pipe = pipe;

  // Re-patch on 'readable'
  stream.once('readable', patchPipe.bind(null, stream));
}

function patch(stream) {
  if (stream._pePatched) {
    return stream;
  }

  patchPipe(stream);

  stream._pePatched = true;

  return stream;
}

function pipe(dest) {
  if (!dest) {
    throw new Error('Can\'t pipe to undefined');
  }

  this._peOriginalPipe.apply(this, arguments);

  removeDefaultHandler(this, 'error');

  patch(dest);

  this.on('error', function (err) {
    dest.emit('error', err);
  });

  return dest;
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

