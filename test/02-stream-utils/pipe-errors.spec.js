/*global describe, it*/
'use strict';

var pipeErrors = require('../../src/pipe-errors');
var gulpUtil = require('gulp-util');
var util = require('util');
var through2 = require('through2');

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
      self.emit('error', new Error('Intended error'));

      // Then emit some data to check if everything is ok
      process.nextTick(function () {
        self.push('test');
      });
    });
  }
};

describe('piped errors', function () {
  function behavesOk(stream, done) {
    var state = 0;
    stream.on('data', function (data) {
      switch (state) {
        case 1:
          if (data.toString() === 'test') {
            state = 2;
            done();
          } else {
            done(new Error('Incorrect data'));
          }
          break;
        case 2:
          break;
        default:
          state = 2;
          done(new Error('Got the data before the error'));
      }
    });
    stream.on('error', function (err) {
      switch (state) {
        case 0:
          if (err.message === 'Intended error') {
            state = 1;
          } else {
            done(err);
          }
          break;
        case 2:
          break;
        default:
          state = 2;
          done(err);
      }
    });
  }

  function realNoop() {
    return through2.obj(function(obj, enc, cb) {
      cb(null, obj);
    });
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
