var JadeFastCompiler = require('./jade-fast-compiler');
var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');
var File = require('vinyl');
var _ = require('lodash');
var when = require('when');
var nodefn = require('when/node');
var fs = require('fs');

var PLUGIN_NAME = 'text-jade';
var boilerplate = [
  'registerChapter({ chapter: "',
  null,
  '", content: ',
  null,
  '});'
];

function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

// minimal jade context, loaded only with the +meta mixins
var jadeContext = null;
function getJadeContext() {
  if (jadeContext) { return jadeContext; }

  jadeContext = JadeFastCompiler.shimmedContext();

  var fpath = path.resolve(__dirname, '..', 'frontend', 'mixins', 'index.jade');
  return nodefn.call(fs.readFile, fpath)
    .then(function (contents) {
      return JadeFastCompiler.compileBundle(contents.toString('utf8'), { filename: fpath });
    })
    .then(function (template) {
      var mixins;
      eval('mixins = ' + template);
      mixins(jadeContext, false, false);
      return jadeContext;
    });
}

module.exports = function textJadeTasks(lfa) {
  var config = lfa.config;

  lfa.task('text:files:jade', function () {
    var self = this;
    var glob = path.join(config.projectPath, 'text', '**', '*.jade');

    self.addFileDependencies(glob);

    return lfa.src(glob, { filterModified: this })
      .pipe(through.obj(function (file, enc, cb) {
        if (file.isStream()) {
          return cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
        }

        var tocpath = file.relative.replace(/\.jade$/, '');
        var url = tocpath.replace(new RegExp(escapeRegExp(path.sep), 'g'), '-');

        when
          .try(function () {
            return JadeFastCompiler.compileBundle(
              file.contents.toString('utf8'),
              { filename: file.path });
          })
          .then(function (template) {
            // We're now trying to extract the +meta calls from the template
            var locals = { meta: {} };
            locals.meta.url = url;
            locals.meta.path = tocpath;

            var shimmedFunction = function () {};
            try {
              eval('shimmedFunction = ' + template);
            } catch (err) {
              err.fileName = file.path;
              throw err;
            }

            // Running the jade file now will probably fail, especially since
            // there are no mixins loaded, but +meta calls are usually at the start
            // of the file and we will reach them without failing
            try {
              shimmedFunction(getJadeContext(), locals, false);
            } catch (ex) {}

            boilerplate[1] = url;
            boilerplate[3] = template;
            var newFile = new File({
              base: '',
              history: file.history.concat([path.join('chapters', url + '.js')]),
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
