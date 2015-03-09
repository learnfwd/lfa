var File = require('vinyl');
var through = require('through2');
var uuid = require('uuid');

module.exports = function liveReloadDummy(lfa) {
  lfa.task('live-reload:collect', [['default:assets', 'default:html', 'default:css']], function (stream) {
    return stream;
  });

  lfa.task('webpack:gen:live-reload', ['live-reload:collect'], function (writtenFiles) {
    var reload = false;
    var stream = lfa.pipeErrors(through.obj());

    writtenFiles.on('data', function () { 
      reload = true;
    });

    writtenFiles.on('end', function () {
      if (reload || !lfa.previousCompile) {
        var contents = 'module.exports = "' + uuid.v4() + '";';
        var file = new File({
          base: '',
          path: 'gen/live-reload-dummy.js',
          contents: new Buffer(contents),
        });
        stream.write(file);
      }
      stream.end();
    });

    return stream;
  });

};
