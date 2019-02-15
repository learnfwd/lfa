var File = require('vinyl');
var through = require('through2');

module.exports = function textVersions(lfa) {
  lfa.task('text-versions:collect', ['text:files:*'], function (stream) {
    this.setDependencyMode(stream, 'modify');
    return stream;
  });

  lfa.task('webpack:gen:text-versions', ['text-versions:collect'], function (writtenFiles) {
    var reload = false;
    var stream = lfa.pipeErrors(through.obj());

    var versions = (lfa.previousCompile ? lfa.previousCompile.textVersions : null ) || {};
    lfa.currentCompile.textVersions = versions;

    writtenFiles.on('data', function (file) {
      if (file.textMeta) {
        reload = true;
        var url = file.textMeta.url;
        versions[url] = (versions[url] || 0) + 1;
      }
    });

    writtenFiles.on('end', function () {
      if (reload || !lfa.previousCompile) {
        var contents = 'module.exports = ' + JSON.stringify(versions) + ';';
        var file = new File({
          path: 'gen/text-versions.js',
          contents: Buffer.from(contents),
        });
        file.webpackAlias = 'text-versions';
        stream.write(file);
      }
      stream.end();
    });

    return stream;
  });

};
