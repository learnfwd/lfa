var path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    minimatch = require('minimatch'),
    output_path = require('../utils/output_path'),
    yaml_parser = require('../utils/yaml_parser'),
    watcher = require('../watcher'),
    lfa = require('../index'),
    Compiler = require('../compiler'),
    server = require('../server'),
    inquirer = require('inquirer'),
    config = require('../global_config');

require('colors');

function askForEmail(args, cb) {
  var conf = config.get();
  var emailRegexp = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

  var se = args['support-email'];
  if (se !== undefined) {
    if (!emailRegexp.test(se)) {
      cb(new Error('Please enter a valid e-mail address'));
      return;
    }
    config.modify('supportEmail', se);
    config.modify('supportEmailAskedFor', true);
    conf.supportEmail = se;
    conf.supportEmailAskedFor = true;
  }

  if (!conf.supportEmailAskedFor) {
    inquirer.prompt([{
      type: 'input',
      name: 'email',
      message: "Be the first to get new features, in-place support while you code and free hosting for your texbook on our servers (coming soon)! Just enter your e-mail here. We will not ever sell or use your data for any other purpose. Type 'never' if you don't want to be asked again",
      default: '',
    }], function (ans) {
      if (ans.email === '') {
        cb(null);
        return;
      }

      config.modify('supportEmailAskedFor', true);

      if (ans.email === 'never') {
        config.modify('supportEmail', '');
        console.log('If you ever change your mind, you can set the email address with ' + 'lfa watch --support-email="your_email@example.com"'.yellow);
        cb(null);
        return;
      }

      if (!emailRegexp.test(ans.email)) {
        cb(new Error('Please enter a valid e-mail address'));
        return;
      }

      config.modify('supportEmail', ans.email);
      cb(null);
    });
  } else {
    cb(null);
  }
}

function execute(args) {
  askForEmail(args, function (err) {
    if (err) {
      console.log(err.message);
    } else {
      watch();
    }
  });
}

var compiler = new Compiler();

var watch = function(options){

  // add in the livereload function
  var socket_script = '<script>' + fs.readFileSync(path.join(__dirname, '../../templates/reload/reload.min.js'), 'utf8') + '</script>';
  var spinner_html = fs.readFileSync(path.join(__dirname, '../../templates/reload/spinner.html'));
  global.options.livereload = socket_script + spinner_html;

  // compile once and run the local server when ready
  compiler.mode('dev');
  var current_directory = path.normalize(process.cwd());

  lfa.compile_project(current_directory, function(){
    server.start(current_directory);
    if(options.cb && typeof options.cb === 'function') {
      options.cb();
    }
  });

  // watch the project for changes and reload
  watcher.watch_directory(current_directory, _.debounce(watch_function, 500));

  function watch_function(file){

    server.compiling();

    // make sure the file wasn't deleted
    if (fs.existsSync(file.fullPath)){
      // if we're in debug mode, run a full project recompile to re-add components
      if (global.options.debug.status) {
        global.options.debug.log('debug mode, reloading project');
        return lfa.compile_project(current_directory, server.reload);
      }

      if (path.extname(file.fullPath) === '.jade') {
        global.options.debug.log('single file changed, single file compile');
        return lfa.compile_template(file.fullPath, server.reload);
      }
      // if there was an error, the whole project needs to be recompiled to
      // get rid of the error message
      if (global.options.error) {
        return compile_project('error');
      }

      // if it's a dynamic file, the entire project needs to be recompiled
      // so that references to it show up in other files
      if (yaml_parser.detect(file.fullPath)) {
        return compile_project('dynamic file');
      }

      // ignored files that are modified are often dependencies
      // for another non-ignored file. Until we have an asset graph
      // in this project, the safest approach is to recompile the
      // whole project when an ignored file is modified.
      var ignored = global.options.ignore_files;

      for (var i = 0; i < ignored.length; i++){
        if (minimatch(path.basename(file.path), ignored[i].slice(1))) {
          global.options.debug.log('ignored file changed, reloading project');
          return lfa.compile_project(current_directory, server.reload);
        }
      }
      compile_single_file(file.fullPath);
    } else {
      // if the changed file was deleted, just remove it in the public folder
      try {
        if (fs.existsSync(file.fullPath)) {
          fs.unlinkSync(output_path(file.fullPath));
        }
      } catch(e) {
        console.log('Error Unlinking File'.inverse.red);
        console.log(e);
      }
      compile_project('files deleted');
    }
  }

};

module.exports = { execute: execute, needs_config: true };

function compile_project(reason){
  global.options.debug.log(reason + ': full project compile');
  global.options.error = false;
  lfa.compile_project(current_directory, server.reload);
}

function compile_single_file(file_path){
  global.options.debug.log('single file compile');
  lfa.compile_project(file_path, server.reload);
}
