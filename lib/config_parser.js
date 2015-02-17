var fs = require('fs'),
    path = require('path'),
    adapters = require('./adapters'),
    yaml = require('./utils/yaml_parser'),
    _ = require('underscore');

// config parser
// -----------------
// Parses the config.yml file in a lfa project,
// adds and configures any additional options, and puts all
// config options inside `global.options`

module.exports = function(args, cb) {
  // pull the app config file
  var opts;
  var config_path = path.join(process.cwd() + '/config.yml');
  if (!fs.existsSync(config_path)) {
    process.stdout.write('\nERROR: No config.yml found.\n'.red);
    process.stdout.write('LFA will not run in a folder that does not contain config.yml.\n\n');
    cb(new Error('No config.yml found'));
    return;
  }
  var contents = fs.existsSync(config_path) ? fs.readFileSync(config_path, 'utf8') : '{}';

  // add local options to global ones; return empty object if the file is empty
  opts = global.options = eval(yaml.parse(contents)) || {};

  // localization
  opts.language = opts.language || 'en';

  // generate book identifier
  var hashCode = function(text) {
	  var hash = 0, i, chr, len;
	  if (text.length === 0) {
      return hash;
    }

	  for (i = 0, len = text.length; i < len; i++) {
	    chr   = text.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash = hash | 0; // Convert to 32bit integer
	  }
	  return (hash).toString(36).substr(1);
	};

  opts.book_id  = opts.book_id || hashCode(opts.title || Math.random().toString());

  opts.text_direction = opts.text_direction || 'ltr';

  // temporary patch for swapping out lfa-patterns
  opts.css_library = opts.css_library || require('../patterns/patterns.js');

  // set views and assets folders
  opts.folder_config = opts.folder_config || {};
  opts.folder_config = _.defaults(opts.folder_config, { views: 'text', assets: 'text/..', layouts: 'templates/layouts' });

  // set up public folder
  opts.output_folder = opts.output_folder || '_build';

  // set up output format
  opts.output_format = global.options.output_format = global.options.output_format || '';

  opts.mixins_file = opts.mixins_file || path.join(__dirname, '..', 'templates', 'mixins', 'static.jade');

  opts.mixins = fs.readFileSync(opts.mixins_file, 'utf8');

  opts.projectMixins = opts.projectMixins || path.join(process.cwd(), 'mixins', 'main.jade');

  if (fs.existsSync(opts.projectMixins)) {
    var extraMixins = fs.readFileSync(opts.projectMixins, 'utf8');
    opts.mixins += extraMixins;
  }

  opts.components = global.options.components = global.options.components || 'true';
  opts.templates = global.options.templates || 'text'

  // livereload function won't render anything unless in watch mode
  opts.livereload = '';

  // figure out which files need to be compiled
  var extensions = opts.compiled_extensions = [];

  for (var key in adapters) {
    extensions.push(adapters[key].settings.file_type);
  }

  // make sure all layout files are ignored
  opts.layouts = opts.layouts || { 'default': 'default.jade', 'blank': 'blank.jade' };

  opts.ignore_files = opts.ignore_files || [];
  opts.ignore_folders = opts.ignore_folders || [];
  opts.watcher_ignore_folders = opts.watcher_ignore_folders || [];
  opts.watcher_ignore_files = opts.watcher_ignore_files || [];

  for (var key in opts.layouts) {
    opts.ignore_files.push(opts.layouts[key]);
  }

  // add partials and temp files
  opts.ignore_files.push('_*'); //partials
  opts.ignore_files.push('*_partial*'); //partials
  opts.ignore_files.push('.*'); //vim swaps, .gitignore, .DS_Store
  opts.ignore_folders.push('_*'); //partials
  opts.ignore_folders.push('.*'); //.git, .lfa

  // add more config stuff to the file ignores
  opts.ignore_files.push('toc.js');
  opts.ignore_files.push('spine.js');
  opts.ignore_files.push('config.yml');

  // add plugins, and public folders to the folder ignores
  opts.ignore_folders.push('text');
  opts.ignore_folders.push('plugins');
  opts.ignore_folders.push('mixins');

  // watcher ignores
  opts.watcher_ignore_files.push('.*'); //vim swaps, .gitignore, .DS_Store
  opts.watcher_ignore_folders.push('_build'); //build output
  opts.watcher_ignore_folders.push('.*'); //.git, .lfa
  opts.watcher_ignore_folders.push('components');

  // format the file/folder ignore patterns
  opts.ignore_files = format_ignores(opts.ignore_files);
  opts.ignore_folders = format_ignores(opts.ignore_folders);
  opts.watcher_ignore_folders = format_ignores(opts.watcher_ignore_folders);
  opts.watcher_ignore_files = format_ignores(opts.watcher_ignore_files);

  function format_ignores(ary){
    return ary.map(function(pat){ return '!' + pat.toString().replace(/\//g, ''); });
  }

  opts.debug = {status: (opts.debug || args.debug)};

  opts.debug.log = function(data, color){
    if (!color) { color = 'grey'; }
    this.status && console.log(data[color]);
  };

  // finish it up!
  opts.debug.log('config options set');
  cb(null);

};
