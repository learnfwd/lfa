var Q = require('q'),
    path = require('path'),
    minimatch = require('minimatch'),
    jade = require('jade'),
    fs = require('fs'),
    _ = require('underscore'), 
    jade_helpers = require('../patterns/lfa-components/js/lib/jade-helpers');

module.exports = {};
module.exports.init = function(root) {

  global.options.toc = [];
  global.options.toc_map = {}; // if this is false, don't create toc manually

  // while we're evaluating the table of contents, we'll also generate the search json file
  global.options.search_content = [];
}

module.exports.run = function(ast) {
  var deferred = Q.defer();

  // write out searchjson.js
  compile_toc();
  save_searchjs();

  deferred.resolve(ast);
  return deferred.promise;
};

// this function will parse a target jade file and send it a dummy variable. inside this dummy variable, mixins can add their own variables by using the "locals" object
module.exports.add_jade = function(path, url, jade_code) {
  // not doing this yet because search indexing might be needed
  // if (!global.options.toc_map) return;
  
  global.jade_helpers = jade_helpers;
  global.window = undefined;
  
  jade_code = jade_code.replace("var self = locals || {};", "var self = null;");
  if (global.options.compiled_mixins)
    jade_code = jade_code.replace("var jade_mixins = {};", "var jade_mixins = {};" + global.options.compiled_mixins);

  jade_f = eval("(function(){var jade=global.jade_helpers;return " + jade_code + ";})")();

  var locals = {url:url};
  var html = jade_f.call(null, locals);

  module.exports.add_toc_item(path, locals);
  module.exports.add_search_item(path, locals, html);
}

module.exports.add_toc_item = function(path, opts) {
  if (global.options.toc_map) {
    global.options.toc_map[path] = opts;
    global.options.debug.log("added " + path + " to toc", "yellow");
  }
};

module.exports.add_search_item = function(path, opts, html) {
  var text = html.replace(/<(?:.|\n)*?>/gm, ' ');
  global.options.search_content.push({
    title: opts.title,
    body: text,
    html: html,
    url: opts.url
  });
};

function save_searchjs() {
  var toc = global.options.toc;
  var searchContent = global.options.search_content;
  searchContent = 'define({ pages: ' + JSON.stringify(searchContent) + ', toc: ' + JSON.stringify(toc) + '});';

  output_path = path.join(process.cwd(), global.options.output_folder, 'js', 'searchjson.js');
  fs.writeFileSync(output_path, searchContent);
  global.options.debug.log('generated js/searchjson.js', 'yellow');
}

function compile_toc() {
  var map = global.options.toc_map;
  //var toc = global.options.toc;

  if (!map) return;
  global.options.debug.log("generating toc");

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
        }
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
