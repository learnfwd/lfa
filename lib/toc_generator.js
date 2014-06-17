var Q = require('q'),
    path = require('path'),
    minimatch = require('minimatch'),
    jade = require('jade'),
    fs = require('fs');

module.exports = {};
module.exports.init = function(root) {
  global.options.toc = [];
  module.exports.root = root;

  // while we're evaluating the table of contents, we'll also generate the search json file
  global.options.search_content = [];
}

module.exports.run = function(ast) {
  var deferred = Q.defer();
  var root = module.exports.root;

  // parse jade files first to establish toc and grab frontmatter
  if (fs.existsSync(path.join(root, global.options.folder_config.views))) {
    create_toc(root);
  }

  // write out searchjson.js
  save_searchjs();

  deferred.resolve(ast);
  return deferred.promise;
};

function save_searchjs() {
  searchContent = global.options.search_content;
  
  cleantoc = function(chapters) {
    var i, len;
    i = 0;
    len = chapters.length;
    while (i < len) {
      delete chapters[i].locals.html;
      delete chapters[i].locals.text;
      if (chapters[i].children && chapters[i].children.length) {
        chapters[i].children = cleantoc(chapters[i].children);
      }
      i++;
    }
    return chapters;
  };
  
  toc = cleantoc(global.options.toc);
  global.options.debug.log(require('util').inspect(toc, false, null), 'yellow');
  searchContent = 'define({ pages: ' + JSON.stringify(searchContent) + ', toc: ' + JSON.stringify(toc) + '});';
  fs.writeFileSync('_build/js/searchjson.js', searchContent);
  global.options.debug.log('generated js/searchjson.js', 'yellow');
}

function create_toc(root) {
  global.options.debug.log('analyzing toc', 'yellow');
  var textPath = path.join(root, 'text');
  var compilePath = path.join(root, global.options.folder_config.views);
  global.options.toc = tree_toc(compilePath, 0);
  
  
  // this function will parse a target jade file and send it a dummy variable. inside this dummy variable, mixins can add their own variables by using the "locals" object
  function parse_locals(filepath) {
    var dummy = {};
    
    var content = fs.readFileSync(filepath, 'utf8');
    if (global.options.mixins) {
      content = global.options.mixins + "\n" + content;
    }
    
    var html = jade.compile(content, { basedir: process.cwd() })(dummy);
    dummy.html = html;
    dummy.text = html.replace(/<(?:.|\n)*?>/gm, ' ');
    
    return dummy;
  }
  
  function tree_toc(p, depth) {
    var files = fs.readdirSync(p);
    var children = [];
    if (depth) { // if we're no longer at the base level
      var firstFile = files[0];
      files = files.slice(1);
    }
    
    for (var i = 0, len = files.length; i < len; i++) {
      var file = files[i],
          ignore = false;
      
      // check if we should be ignoring the file
      for (var j = 0, ignlen = global.options.ignore_files.length; j < ignlen; j++) {
        var pattern = global.options.ignore_files[j];
        if (!minimatch(file, pattern)) {
          ignore = true;
          break;
        }
      }
      if (ignore) {
        continue;
      }
      var newPath = path.join(p, file);
      if (fs.lstatSync(newPath).isFile()) {
        var locals = parse_locals(newPath),
            url = newPath.replace(textPath + path.sep, '').replace(".jade", "").replace(/\\/g, '-').replace(/\//g, '-');
        children.push({
          locals: locals,
          children: [],
          url: url
        });
        
        global.options.search_content.push({
          title: locals.title,
          body: locals.text,
          html: locals.html,
          url: url
        });
      } else {
        var folder = tree_toc(newPath, depth + 1);
        children.push(folder);
      }
    }
    
    if (depth) { // if we're no longer at the base level
      var newPath = path.join(p, firstFile);
      var locals = parse_locals(newPath),
          url = newPath.replace(textPath + path.sep, '').replace(".jade", "").replace(/\\/g, '-').replace(/\//g, '-');
      var result = {
        locals: locals,
        children: children,
        url: url
      };
        
      global.options.search_content.push({
        title: locals.title,
        body: locals.text,
        html: locals.html,
        url: url
      });
    } else {
      var result = children;
    }
    
    return result;
  }
  
  // global.options.debug.log("TOC:\n" + util.inspect(global.options.toc, false, null), "yellow");
}
