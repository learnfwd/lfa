var colors = require('colors'),
    async = require('async'),
    shell = require('shelljs'),
    path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    readdirp = require('readdirp'),
    minimatch = require('minimatch'),
    Q = require('q'),
    deferred = Q.defer(),
    add_error_messages = require('./utils/add_error_messages'),
    output_path = require('./utils/output_path'),
    yaml_parser = require('./utils/yaml_parser'),
    precompile_templates = require('./precompiler'),
    Compiler = require('./compiler'),
    util = require('util');

// initialization and error handling

var compiler = new Compiler();
_.bindAll(compiler, 'compile', 'copy', 'finish');

compiler.on('error', function(err){
  console.log('\u0007'); // bell sound
  console.error("\n\n------------ ERROR ------------\n\n".red + err.stack + "\n");
  add_error_messages.call(this, err, this.finish);
});

// @api public
// Given a root (folder or file), compile with lfa and output to /_build

exports.compile_project = function(root, done){

  compiler.once('finished', function(){
    process.stdout.write('done!\n'.green);
    done();
  });

  process.stdout.write('compiling... '.grey);
  global.options.debug.log('');
  
  // parse jade files first to establish toc and grab frontmatter
  if (fs.existsSync(path.join(root, global.options.folder_config.views))) {
    create_toc(root);
  }
  
  analyze(root)
  .then(create_folders)
  .then(compile)
  .then(precompile_templates)
  .then(compiler.finish, function(err){ compiler.emit('error', err); });
};

// @api private
// parse file/directory input and generate mini roots-style AST.

function create_toc(root) {
  var textPath = path.join(root, global.options.folder_config.views);
  global.options.toc = tree_toc(textPath, 0);
  
  function tree_toc(p, depth) {
    var files = fs.readdirSync(p);
    var children = [];
    if (depth) { // if we're no longer at the base level
      var firstFile = files[0];
      files = files.slice(1);
    }
    
    files.forEach(function(file) {
      var newPath = path.join(p, file);
      if (fs.lstatSync(newPath).isFile()) {
        var yml = yaml_parser.readParse(newPath);
        if (!yml.hidden_toc) { // if the file is not hidden from the toc
          children.push({
            fm: yaml_parser.readParse(newPath),
            children: null,
            url: newPath.replace(textPath + path.sep, '').replace(".jade", ".html").replace('\\', '/')
          });
        }
      } else {
        var folder = tree_toc(newPath, depth + 1);
        if (!folder.fm.hidden_toc) { // if the folder is not hidden from the toc
          children.push(folder);
        }
      }
    });
    
    if (depth) { // if we're no longer at the base level
      var newPath = path.join(p, firstFile);
      var result = {
        fm: yaml_parser.readParse(newPath),
        children: children,
        url: newPath.replace(textPath + path.sep, '').replace(".jade", ".html").replace('\\', '/')
      }
    } else {
      var result = children;
    }
    
    return result;
  }
  
  global.options.debug.log("TOC:\n" + util.inspect(global.options.toc, false, null), "green");
}

function analyze(root){
  global.options.debug.log('analyzing project', 'yellow');

  var ast = {
    folders: {},
    compiled_files: [],
    static_files: [],
    text_files: []
  };

  if (fs.statSync(root).isDirectory()) {
    return parse_directory(root);
  } else {
    parse_file(root);
    return Q.fcall(function(){
      return ast;
    });
  }

  function parse_directory(root){

    // clear the dynamic locals first
    global.options.site = null;

    // read through the current project and organize the files
    var options = {
      root: root,
      directoryFilter: global.options.ignore_folders,
      fileFilter: global.options.ignore_files
    };

    readdirp(options, function(err, res){
      if (err) { console.error(err); }

      // populate folders
      ast.folders = _.pluck(res.directories, 'fullPath');

      // populate compiled and copied files
      res.files.forEach(function(file){
        parse_file(file.fullPath);
      });

      deferred.resolve(ast);

    });

    return deferred.promise;
  }

  function parse_file(file){
    if (is_text(file)) {
      ast.text_files.push(file);
    } else if (is_template(file)) {
      return false;
    } else if (is_compiled(file)) {
      ast.compiled_files.push(file);
    } else {
      ast.static_files.push(file);
    }
  }
  
  function is_text(file) {
    return path.extname(file).slice(1) == "jade";
  }

  function is_compiled(file) {
    return global.options.compiled_extensions.indexOf(path.extname(file).slice(1)) >= 0
  }

  function is_template(file) {
    return minimatch(file, '**/' + global.options.templates + '/*')
  }

}

// @api private
// compile and write the files given a roots-style AST.

function compile(ast){
  global.options.debug.log('compiling and copying files', 'yellow');

  async.parallel([compile_text_files, compile_files, copy_static_files, copy_components], function(err) {
    if (err) { deferred.reject(err); }
    deferred.resolve(ast);
  });

  function compile_text_files(cb) {
    async.map(ast.text_files, compiler.compile, cb);
  }
  
  function compile_files(cb) {
    async.map(ast.compiled_files, compiler.compile, cb);
  }
  
  function copy_static_files(cb) {
    async.map(ast.static_files, compiler.copy, cb);
  }
  
  function copy_components(cb) {
    if (global.options.components == "false") {
      global.options.debug.log('skipping component library inclusion', 'yellow');
    } else {
      global.options.debug.log('adding component library', 'yellow');
      shell.cp(
        '-rf', 
        path.join(__dirname, '../node_modules/' + options.css_library, '/lfa-components'), 
        path.join(path.normalize(process.cwd()), options.output_folder)
      );
    }
    cb();
  }

  return deferred.promise;
}

// @api private
// create the folder structure for the project

function create_folders(ast){
  global.options.debug.log('creating folders', 'yellow');
  shell.mkdir('-p', path.join(process.cwd(), options.output_folder));

  for (var key in ast.folders) {
    var folders = ast.folders[key].replace(process.cwd(), '').split('/');
    
    shell.mkdir('-p', output_path(ast.folders[key]));
    global.options.debug.log('created ' + ast.folders[key].replace(process.cwd(),''));
  }

  return Q.fcall(function(){
    return ast;
  });
}
