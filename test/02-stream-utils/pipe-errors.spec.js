/*global describe, it*/
'use strict';

var pipeErrors = require('../../src/pipe-errors');
var gulpUtil = require('gulp-util');
var util = require('util');
var through2 = require('through2');
var es = require('event-stream');

var Readable = require('stream').Readable;

function ErroringStream(opt) {
  Readable.call(this, opt);
}

util.inherits(ErroringStream, Readable);

ErroringStream.prototype._read = function() {
  // If I were to emit right now, Stream would throw at pipeline creation time,
  // which is ok. Those errors are caught by when.try() in lfa.compile()
  
  var self = this;

  if (!this._firstTime) {
    this._firstTime = true;
    process.nextTick(function () {
      // First some data
      self.push('test_begin');

      process.nextTick(function () {
        // Then an error
        self.emit('error', new Error('Intended error'));
      });
    });
  }
};

describe('piped errors', function () {
  function behavesOk(stream, done) {
    var state = 0;
    stream.on('data', function (data) {
      switch (state) {
        case 0:
          if (data.toString() === 'test_begin') {
            state = 1;
          } else {
            state = 3;
            done(new Error('Incorrect data'));
          }
          break;
        case 3:
          break;
        default:
          state = 3;
          done(new Error('Got the data before the error'));
      }
    });
    stream.on('error', function (err) {
      switch (state) {
        case 0:
          state = 3;
          done(new Error('Should have recieived data first'));
          break;
        case 1:
          if (err.message === 'Intended error') {
            state = 3;
            done();
          } else {
            state = 3;
            done(err);
          }
          break;
        case 3:
          break;
        default:
          state = 3;
          done(err);
      }
    });

    stream.on('end', function() {

    });
  }

  function realNoop() {
    return through2.obj(function(obj, enc, cb) {
      cb(null, obj);
    });
  }

  function emptyStream() {
    var stream = pipeErrors(through2.obj(function(obj, enc, cb) {
      cb(null, obj);
    }));

    process.nextTick(function () {
      stream.end();
    });

    return stream;
  }

  it('should propagate', function (done) {
    behavesOk(
      pipeErrors(new ErroringStream())
        .pipe(realNoop()),
      done
    );
  });

  it('should not patch twice', function (done) {
    behavesOk(
      pipeErrors(new ErroringStream())
        .pipe(pipeErrors(realNoop())),
      done
    );
  });

  it('should propagate to multiple pipes', function (done) {
    var source = pipeErrors(new ErroringStream());
    var count = 0;
    function done2(err) {
      if (err) { done(err); count = -1000; }
      if (++count === 2) { done(); }
    }

    behavesOk(source.pipe(pipeErrors(realNoop())), done2);
    behavesOk(source.pipe(pipeErrors(realNoop())), done2);
  });

  it('should propagate to multiple patched pipes', function (done) {
    var source = pipeErrors(new ErroringStream());
    var count = 0;
    function done2(err) {
      if (err) { done(err); count = -1000; }
      if (++count === 2) { done(); }
    }

    behavesOk(source.pipe(realNoop()), done2);
    behavesOk(source.pipe(realNoop()), done2);
  });

  it('should propagate to merged stream', function (done) {
    var sources = [
      emptyStream(),
      pipeErrors(new ErroringStream()),
      emptyStream(),
    ];

    behavesOk(es.merge.apply(es, sources), done);
  });

  it('should propagate when used via stream.Readable monkey patch', function (done) {
    pipeErrors.monkeyPatch();

    behavesOk(
      new ErroringStream()
        .pipeErrors() 
        .pipe(realNoop()),
      done
    );
  });
});
