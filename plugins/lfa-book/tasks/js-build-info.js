var through = require('through2');
var path = require('path');
var _ = require('lodash');
var File = require('vinyl');

module.exports = function buildInfoJS(lfa) {
  var config = lfa.config;

  function buildToC(map) {
    var root = {
      children: [],
      map: {}
    };

    var keys = _.keys(map);
    keys = _.filter(keys, function (o) {
      return !map[o].noToC;
    });
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
    files = _.filter(files, function (o) {
      return !map[o].noSpine && !map[o].noContent;
    });
    files.sort();
    return _.map(files, function(o) { return map[o].url; });
  }

  lfa.task('webpack:gen:buildinfo', ['text:files:*'], function (textFiles) {
    var previousChapters = (lfa.previousCompile ? lfa.previousCompile.chapters : {}) || {};
    var previousFiles = lfa.previousCompile ? (lfa.previousCompile.textFilesToChapters || {}) : {};
    var chapters = _.cloneDeep(previousChapters);
    var files = _.cloneDeep(previousFiles);
    lfa.currentCompile.chapters = chapters;
    lfa.currentCompile.textFilesToChapters = files;

    var stream = lfa.pipeErrors(through.obj());
    var shouldBuild = !lfa.previousCompile;

    textFiles.on('data', function (file) {
      if (file.deleted) {
        var deletedPath = file.history[0];
        delete chapters[files[deletedPath]];
        delete files[deletedPath];
        shouldBuild = true;
      } else if (file.textMeta) {
        files[file.history[0]] = file.textMeta.path;
        chapters[file.textMeta.path] = file.textMeta;
        shouldBuild = true;
      }
    });

    textFiles.on('error', function (err) {
      stream.emit('error', err);
    });

    textFiles.on('end', function () {
      if (lfa.previousCompile && 
          (!shouldBuild || _.isEqual(previousChapters, chapters))) {
        stream.end();
        return;
      }

      var toc = buildToC(chapters);
      var spine = buildSpine(chapters);

      var json = {
        book: config.book,
        bookId: config.bookId,
        debug: true,
        toc: toc,
        spine: spine,
        chapters: _.map(_.values(chapters), function (o) { return o.url; }),
        version: config.package.version,
        patchServer: config.package.lfa.patchServer,
        
        // Deprecated:
        language: config.book.language,
        textDirection: config.book.textDirection,
      };

      var contents = JSON.stringify(json, null, 2);

      var file = new File({
        base: '',
        path: 'gen/modules/build-info.json',
        contents: new Buffer(contents),
      });
      file.webpackAlias = ['build-info', 'searchjson'];
      stream.write(file);
      stream.end();
    });

    return stream;
  });
};
