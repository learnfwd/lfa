var Q = require('q'),
    path = require('path'),
    minimatch = require('minimatch'),
    jade = require('jade'),
    fs = require('fs'),
    _ = require('underscore'),
    Compiler = require('./compiler'),
    config = require('./global_config');

module.exports = {};
module.exports.init = function(root) {
  var deferred = Q.defer();

  global.options.toc = [];
  global.options.spine = [];
  global.options.generateToc = true;
  global.options.generateSpine = true;
  global.options.toc_map = {};

  // while we're evaluating the table of contents, we'll also generate the search json file
  global.options.search_content = [];

  var solvedCount = 0;
  function solved() {
    if (++solvedCount === 2) {
      deferred.resolve();
    }
  }

  fs.readFile(path.join(root, 'toc.js'), function (err, data) {
    if (!err) {
      try {
        global.options.toc = JSON.parse(data.toString());
        global.options.generateToc = false;
      } catch(ex) {}
    }
    solved();
  });

  fs.readFile(path.join(root, 'spine.js'), function (err, data) {
    if (!err) {
      try {
        global.options.spine = JSON.parse(data.toString());
        global.options.generateSpine = false;
      } catch(ex) {}
    }
    solved();
  });

  return deferred.promise;
};

module.exports.run = function(ast) {
  var deferred = Q.defer();

  // write out searchjson.js
  compile_toc();
  compile_spine();
  save_searchjs();

  deferred.resolve(ast);
  return deferred.promise;
};

module.exports.add_toc_item = function(path, opts) {
  global.options.toc_map[path] = opts;
  global.options.debug.log("added " + path + " to spine", "yellow");
};

module.exports.add_search_item = function(path, opts, html) {
  var text = html.replace(/<(?:.|\n)*?>/gm, ' ');
  global.options.search_content.push({
    title: opts.title,
    //body: text,
    //html: html,
    url: opts.url
  });
};

function save_searchjs() {
  var json = {
    debug: (Compiler._mode === 'dev'),
    pages: global.options.search_content,
    toc: global.options.toc,
    spine: global.options.spine,
    language: global.options.language,
    textDirection: global.options.text_direction,
    bookId: global.options.book_id,
    creatorTrackingId: config.get('trackingUUID'),
  };

  var data = 'define(' + JSON.stringify(json) + ');';

  output_path = path.join(process.cwd(), global.options.output_folder, 'js', 'searchjson.js');
  fs.writeFileSync(output_path, data);
  global.options.debug.log('generated js/searchjson.js', 'yellow');
}

function compile_spine() {
  var map = global.options.toc_map;
  if (!global.options.generateSpine) { return; }
  global.options.debug.log('generating spine');

  var files = _.keys(map);
  files.sort();
  var keys = _.map(files, function(o) { return map[o].url; });

  global.options.spine = keys;
}

function compile_toc() {
  var map = global.options.toc_map;

  if (!global.options.generateToc) { return; }
  global.options.debug.log('generating toc');

  var root = {
    children: [],
    map: {}
  };

  var keys = _.keys(map);
  keys.sort();

  for (var i = 0, n = keys.length; i < n; i++) {
    var key = keys[i];
    var splitPath = key.split(path.sep);

    var node = root;
    for (var j = 0, m = splitPath.length; j < m; j++) {
      var component = splitPath[j];
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
    }
    node.locals = map[key];
    node.url = node.locals.url;
  }

  // determining the index page for each node
  function set_node_index(node) {
    for (var i = 0, v = node.children, n = v.length; i < n; i++)
      set_node_index(v[i]);

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

  for (var i = 0, v = root.children, n = v.length; i < n; i++)
    set_node_index(v[i]);
  global.options.toc = root.children;

  global.options.debug.log(require('util').inspect(global.options.toc, false, null), 'yellow');
}
