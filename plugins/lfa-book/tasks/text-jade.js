var JadeFastCompiler = require('../../lfa-compilation/lib/jade-fast-compiler');
var through = require('through2');
var path = require('path');
var File = require('vinyl');
var _ = require('lodash');
var when = require('when');
var nodefn = require('when/node');
var fs = require('fs');
var safeEval = require('./safe-eval');
var es = require('event-stream');
var PluginError = require('plugin-error');

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
  if (jadeContext) { return when(jadeContext); }

  jadeContext = JadeFastCompiler.shimmedContext();

  var fpath = path.resolve(__dirname, '..', 'frontend', 'mixins', 'index.jade');
  return nodefn.call(fs.readFile, fpath)
    .then(function (contents) {
      return JadeFastCompiler.compileBundle(contents.toString('utf8'), { filename: fpath });
    })
    .then(function (template) {
      var mixins = safeEval(template);
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

    var removedFiles = self.filterModifiedFiles(glob, ['removed']);
    var removedStream = lfa.pipeErrors(through.obj());
    process.nextTick(function () {
      _.each(removedFiles, function (removedFile) {
        var file = new File({
          path: removedFile
        });
        file.deleted = true;
        removedStream.write(file);
      });
      removedStream.end();
    });

    var filesStream = lfa.src(glob, { filterModified: self })
      .pipe(through.obj(function (file, enc, cb) {
        if (file.isStream()) {
          return cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
        }

        var tocpath = file.relative.replace(/\.jade$/, '');
        var url = tocpath.replace(new RegExp(escapeRegExp(path.sep), 'g'), '-');

        when
          .try(function () {
            return JadeFastCompiler.compileBundle(file.contents.toString('utf8'), { filename: file.path });
          })
          .then(function (template) {
            // We're now trying to extract the +meta calls from the template
            var locals = { meta: {} };
            locals.meta.url = url;
            locals.meta.path = tocpath;

            var shimmedFunction = function () {};
            try {
              shimmedFunction = safeEval(template);
            } catch (err) {
              err.fileName = file.path;
              throw err;
            }

            return getJadeContext()
              .then(function (context) {
                // Running the jade file now will probably fail, especially since
                // there are no mixins loaded, but +meta calls are usually at the start
                // of the file and we will reach them without failing
                try { shimmedFunction(context, locals, false); } catch (ex) {}
              })
              .then(function () {
                boilerplate[1] = url;
                boilerplate[3] = template;

                var newFile = new File({
                  history: file.history.concat([path.join('chapters', url + '.js')]),
                  contents: locals.meta.noContent ? null : Buffer.from(boilerplate.join(''), 'utf8'),
                });

                newFile.textMeta = locals.meta;
                cb(null, newFile);
              });
          })
          .catch(function(err) {
            return cb(new PluginError(PLUGIN_NAME, err));
          });

      }));

    return es.merge(removedStream, filesStream);
  });
};
