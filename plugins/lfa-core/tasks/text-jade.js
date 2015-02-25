var jade = require('accord').load('jade');
var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');
var File = require('vinyl');

var PLUGIN_NAME = 'text-jade';
var boilerplate = [
  'registerChapter({ chapter: "',
  null,
  '", content: function () { return ',
  null,
  '; }});'
];

module.exports = function textJadeTasks(lfa) {
  var config = lfa.config;

  lfa.task('text:files:jade', function () {
    var glob = path.join(config.projectPath, 'text', '**', '*.jade');

    return lfa.src(glob)
      .pipe(through.obj(function (file, enc, cb) {
        if (file.isStream()) {
          return cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
        }

        var opts = {};
        opts.filename = file.path;

        var url = file.relative.replace(path.sep, '-').replace(/\.jade$/, '');

        jade.compile(file.contents.toString('utf8'), opts)
          .then(function (res) {
            var locals = { meta: {} };
            locals.meta.url = url;
            var text = res.result(locals);

            boilerplate[1] = url;
            boilerplate[3] = JSON.stringify(text);
            var newFile = new File({
              base: '',
              path: path.join('chapters', url + '.js'),
              contents: new Buffer(boilerplate.join(''), 'utf8'),
            });
            newFile.textMeta = locals.meta;
            cb(null, newFile);
          })
          .catch(function(err) {
            return cb(new gutil.PluginError(PLUGIN_NAME, err));
          });

      }));
  });
};
