var fs = require('fs'),
    path = require('path'),
    shell = require('shelljs'),
    adapters = require('./adapters'),
    colors = require('colors'),
    yaml = require('./utils/yaml_parser');

// config parser
// -----------------
// Parses the config.jade file in a lfa project,
// adds and configures any additional options, and puts all
// config options inside `global.options`

module.exports = function(args, cb){
  // pull the app config file
  var opts;
  var config_path = path.join(process.cwd() + '/config.jade');
  var contents = fs.existsSync(config_path) ? fs.readFileSync(config_path, 'utf8') : '{}';

  // add local options to global ones; return empty object if the file is empty
  opts = global.options = eval(yaml.parse(contents)) || {};

  // temporary patch for swapping out lfa-patterns
  opts.css_library = opts.css_library || 'lfa-patterns';

  // set views and assets folders
  opts.folder_config = opts.folder_config || { views: 'text', assets: 'text/..', layouts: 'templates/layouts' };

  // set up public folder
  opts.output_folder = opts.output_folder || '_build';
  
  opts.mixins_file = opts.mixins_file || path.join(__dirname, "../templates/mixins/static.jade");
  
  opts.mixins = fs.readFileSync(opts.mixins_file, 'utf8');
  
  opts.components = global.options.components = global.options.components || "true";

  // livereload function won't render anything unless in watch mode
  opts.livereload = "";

  // add order function to locals
  // opts.sort = function(ary, opts) {
  //   opts = opts || {};
  //   opts.by = opts.by || 'order';
  // 
  //   if (opts.fn) return ary.sort(opts.fn);
  // 
  //   if (opts.by === 'date') {
  //     return ary.sort(function(a, b){
  //       if (new Date(a[opts.by]) > new Date(b[opts.by])) { return -1; } else { return 1; }
  //     });
  //   }
  // 
  //   if (opts.order === 'asc') {
  //     return ary.sort(function(a, b){
  //       if (a[opts.by] > b[opts.by]) { return -1; } else { return 1; }
  //     });
  //   } else {
  //     return ary.sort(function(a, b){
  //       if (a[opts.by] < b[opts.by]) { return -1; } else { return 1; }
  //     });
  //   }
  // 
  // };

  // figure out which files need to be compiled
  var extensions = opts.compiled_extensions = [];

  for (var key in adapters) {
    extensions.push(adapters[key].settings.file_type);
  }

  // make sure all layout files are ignored
  opts.ignore_files = opts.ignore_files || ['_*', '*_partial*', 'readme*', '.gitignore', '.DS_Store'];
  opts.layouts = opts.layouts || { 'default': 'default.jade', 'blank': 'blank.jade' };

  for (var key in opts.layouts) {
    opts.ignore_files.push(opts.layouts[key]);
  }

  // add config.jade to the file ignores
  opts.ignore_files.push('config.jade');

  // add plugins, and public folders to the folder ignores
  opts.ignore_folders = opts.ignore_folders || ['.git'];
  opts.ignore_folders = opts.ignore_folders.concat([opts.output_folder, 'plugins']);

  // ignore js templates folder
  // this is currently not working because of an issue with
  // readdirp: https://github.com/thlorenz/readdirp/issues/4
  if (opts.templates) opts.ignore_folders = opts.ignore_folders.concat([opts.templates]);

  // configure the base watcher ignores
  opts.watcher_ignore_folders = opts.watcher_ignore_folders || [];
  opts.watcher_ignore_files = opts.watcher_ignore_files || [];

  opts.watcher_ignore_folders = opts.watcher_ignore_folders.concat(['components', 'plugins', '.git', opts.output_folder]);
  opts.watcher_ignore_files = opts.watcher_ignore_files.concat(['.DS_Store']);

  // format the file/folder ignore patterns
  opts.ignore_files = format_ignores(opts.ignore_files);
  opts.ignore_folders = format_ignores(opts.ignore_folders);
  opts.watcher_ignore_folders = format_ignores(opts.watcher_ignore_folders);
  opts.watcher_ignore_files = format_ignores(opts.watcher_ignore_files);

  function format_ignores(ary){
    return ary.map(function(pat){ return "!" + pat.toString().replace(/\//g, ""); });
  }

  opts.debug = {status: (opts.debug || args.debug)};

  opts.debug.log = function(data, color){
    if (!color) color = 'grey';
    this.status && console.log(data[color]);
  };

  // finish it up!
  opts.debug.log('config options set');
  cb();

};
