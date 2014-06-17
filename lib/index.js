// TODO: find a better place for this.
String.prototype.hashCode = function () {
  var hash = 0, char;
  if (this.length === 0) {
    return hash;
  }
  for (var i = 0, len = this.length; i < len; i++) {
    char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

var colors = require('colors'),
    async = require('async'),
    shell = require('shelljs'),
    path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    readdirp = require('readdirp'),
    minimatch = require('minimatch'),
    Q = require('q'),
    add_error_messages = require('./utils/add_error_messages'),
    output_path = require('./utils/output_path'),
    yaml_parser = require('./utils/yaml_parser'),
    precompiler = require('./precompiler'),
    toc_generator = require('./toc_generator'),
    Compiler = require('./compiler'),
    util = require('util'),
    jade = require('jade'),
    mkdirp = require('mkdirp');

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

  toc_generator.init(root);

  analyze(root)
  .then(create_folders)
  .then(compile)
  .then(precompiler.run)
  .then(toc_generator.run)
  .then(compiler.finish, function(err){ compiler.emit('error', err); });
};

exports.compile_template = function(path, done) {

  compiler.once('finished', function(){
    process.stdout.write('done!\n'.green);
    done();
  });
  
  process.stdout.write('compiling... '.grey);
  global.options.debug.log('');
  
  precompiler.getFiles(precompiler.options, function() {
    precompiler.p.initTemplates(precompiler.p.templates);
    precompiler.p.compileTemplate(path);
    
    compiler.finish();
  });
};


// @api private
// parse file/directory input and generate mini roots-style AST.

function analyze(root){
  global.options.debug.log('analyzing project', 'yellow');

  var ast = {
    folders: {},
    compiled_files: [],
    static_files: []
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
    var deferred = Q.defer();

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
    if (is_template(file)) {
      return false;
    } else if (is_compiled(file)) {
      ast.compiled_files.push(file);
    } else {
      ast.static_files.push(file);
    }
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
  var deferred = Q.defer();

  global.options.debug.log('compiling and copying files', 'yellow');

  async.parallel([compile_files, copy_static_files, copy_components], function(err) {
    if (err) { deferred.reject(err); }
    deferred.resolve(ast);
  });
  
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
        path.join(__dirname, '..', 'patterns', 'lfa-components', path.sep, '*'), 
        path.join(path.normalize(process.cwd()), options.output_folder, 'lfa')
      );
    }
    
    // Create a js/main.js file if it doesn't exist. Need this for require monkey business.
    mkdirp(path.join(process.cwd(), options.output_folder, 'js'), function(err) {
      fs.openSync(path.join(process.cwd(), options.output_folder, 'js', 'main.js'), 'a');
    });
    
    var write_content = fs.readFileSync(path.join(__dirname, '..', 'templates', 'layout', 'index.jade'), 'utf8');
    if (global.options.mixins) {
      write_content = global.options.mixins + "\n" + write_content;
    }
    write_content = jade.compile(write_content, {
      pretty: !global.options.compress,
      basedir: process.cwd()
    });
    
    fs.writeFileSync(path.join('_build', 'index.html'), write_content(global.options));
    
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
    var folders = ast.folders[key].replace(process.cwd(), '').split(path.sep);
    
    shell.mkdir('-p', output_path(ast.folders[key]));
    global.options.debug.log('created ' + ast.folders[key].replace(process.cwd(),''));
  }

  return Q.fcall(function(){
    return ast;
  });
}
