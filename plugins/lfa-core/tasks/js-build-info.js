var through = require('through2');
var path = require('path');
var _ = require('lodash');
var File = require('vinyl');

var textFiles = require('./text');

module.exports = function buildInfoJS(lfa) {
  var config = lfa.config;
  textFiles(lfa);

  function buildToC(map) {
    var root = {
      children: [],
      map: {}
    };

    var keys = _.keys(map);
    keys.sort();

    _.each(keys, function (key) {
      var splitPath = key.split(path.sep);

      var node = root;
      _.each(splitPath, function (component) {
        var newNode = node.map[component];
        if (!newNode) {
          newNode = {
            children: [],
            map: {}
          };
          node.map[component] = newNode;
          node.children.push(newNode);
        }
        node = newNode;
      });
      node.locals = map[key];
      node.url = node.locals.url;
    });

    // determining the index page for each node
    function setNodeIndex(node) {
      _.each(node.children, setNodeIndex);

      if (!node.locals && node.children.length) {
        var firstChild = node.children[0];
        node.locals = firstChild.locals;
        node.url = firstChild.url;

        if (!firstChild.children.length) {
          node.children.splice(0, 1);
        }
      }
      delete node.map;
    }

    _.each(root.children, setNodeIndex);
    return root.children;
  }

  function buildSpine(map) {
    var files = _.keys(map);
    files.sort();
    return _.map(files, function(o) { return map[o].url; });
  }

  lfa.task('webpack:gen:buildinfo', ['text:files:*'], function (textFiles) {

    var chapters = {};

    var stream = lfa.pipeErrors(through.obj());
    textFiles.pipe(through.obj(function (file, enc, cb) {
      if (file.textMeta) {
        chapters[path.relative(file.base, file.path)] = file.textMeta;
      }
      cb(null);
    }));

    textFiles.on('error', function (err) {
      stream.emit('error', err);
    });

    textFiles.on('end', function () {
      var toc = buildToC(chapters);
      var spine = buildSpine(chapters);

      var json = {
        book: config.book,
        bookId: config.bookId,
        debug: true,
        toc: toc,
        spine: spine,
        chapters: _.map(_.values(chapters), function (o) { return o.url; }),
        
        // Deprecated:
        language: config.book.language,
        textDirection: config.book.textDirection,
      };

      var contents = JSON.stringify(json, null, 2);
      //AMD bullshit
      contents = 'define(' + contents + ');';

      var file = new File({
        base: '',
        path: 'gen/modules/build-info.js',
        contents: new Buffer(contents),
      });
      file.webpackAlias = ['build-info', 'searchjson'];
      stream.write(file);
      stream.end();
    });

    return stream;
  });
};
