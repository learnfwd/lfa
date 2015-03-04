var File = require('vinyl');
var path = require('path');
var through = require('through2');
var _ = require('lodash');
var fs = require('fs');
var nodefn = require('when/node');
var when = require('when');
var Resolver = require('async-resolve');
var resolve = new Resolver();

module.exports = function entrypointsJS(lfa) {
  lfa.task('webpack:gen:entrypoints', function () {
    var stream = lfa.pipeErrors(through.obj());

    var entrypoints = _.map(lfa.plugins, function (plugin) {
      return { 
        name: plugin.name,
        dir: path.join(plugin.path, 'frontend', 'js'),
      };
    });
    entrypoints.push({
      name: 'userland',
      dir: path.join(lfa.config.projectPath, 'js'),
    });

    when.all(_.map(entrypoints, function (ep) {
      return nodefn.call(resolve.resolve.bind(resolve), ep.dir, __dirname)
        .then(function (file) {
          return nodefn.call(fs.stat, file);
        })
        .then(function (stat) {
          if (!stat.isFile()) { 
            throw new Error('Not a file'); 
          }
          ep.exists = true;
        })
        .catch(function (err) {
          ep.exists = false;
        })
        .then(function () {
          return ep;
        });

    })).then(function (ep) {
      var content = _.map(ep, function (o) {
        if (!o.exists) { return ''; }
        return 'require("' + o.name + '");\n';
      }).join('');

      stream.write(new File({
        base: '',
        path: 'gen/index.js',
        contents: new Buffer(content),
      }));
      stream.end();
    });

    return stream;
  });
};
