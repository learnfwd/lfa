var through = require('through2');
var path = require('path');
var _ = require('lodash');
var File = require('vinyl');
var templatizer = require('templatizer');
var when = require('when');
var fs = require('fs');

module.exports = function templatesJS(lfa) {
  var config = lfa.config;

  lfa.task('requirejs:files:templates', function () {
    var stream = lfa.pipeErrors(through.obj());

    var templatePaths = [ path.join(config.projectPath, 'js', 'templates') ];
    _.each(lfa.plugins, function (plugin) {
      templatePaths.push(path.join(plugin.path, 'frontend', 'js', 'templates'));
    });

    process.nextTick(function () {
      when.all(_.map(templatePaths, function (tp) {
        return when.promise(function (resolve) {
          fs.exists(tp, function (res) {
            resolve(res ? tp : null);
          });
        });
      }))
        .then(function (paths) {
          paths = _.filter(paths, function (o) { return o !== null; });
          var content = paths.length ? 
            templatizer(paths, null) :
            'define({});';

          stream.write(new File({
            base: '',
            path: 'js/templates.js',
            contents: new Buffer(content)
          }));
          stream.end();
        })
        .catch(function (err) {
          stream.emit('error', err);
        });
    });

    return stream;
  });
};
