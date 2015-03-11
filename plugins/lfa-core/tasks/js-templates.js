var through = require('through2');
var path = require('path');
var _ = require('lodash');
var File = require('vinyl');
var templatizer = require('templatizer');
var when = require('when');
var fs = require('fs');
var nodefn = require('when/node');

module.exports = function templatesJS(lfa) {
  var config = lfa.config;

  lfa.task('webpack:gen:templates', function () {
    var stream = lfa.pipeErrors(through.obj());

    var templatePaths = _.map(lfa.plugins, function (plugin) {
      return path.join(plugin.path, 'frontend', 'js', 'templates');
    });
    templatePaths.push(path.join(config.projectPath, 'js', 'templates'));

    process.nextTick(function () {
      when.all(_.map(templatePaths, function (tp) {
        return nodefn.call(fs.stat, tp)
          .then(function (stat) {
            return stat.isDirectory() ? tp : null;
          })
          .catch(function () {
            return null;
          });
      }))
        .then(function (paths) {
          paths = _.filter(paths, function (o) { return o !== null; });
          var opts = {
            dontRemoveMixins: true,
          };
          var content = paths.length ? 
            templatizer(paths, null, opts).replace('require("fs")', '(function () { throw new Error("No such module"); })()') :
            'define({});';


          var file = new File({
            base: '',
            path: 'gen/modules/templates.js',
            contents: new Buffer(content)
          });
          file.webpackAlias = 'templates';
          stream.write(file);
          stream.end();
        })
        .catch(function (err) {
          stream.emit('error', err);
        });
    });

    return stream;
  });
};
