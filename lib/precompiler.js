var jade = require('jade'),
  fs = require('fs'),
  path = require('path'),
  _ = require('underscore'),
  mkdirp = require('mkdirp'),
  readdirp = require('readdirp'),
  Q = require('q'),
  toc_generator = require('./toc_generator');
  compressor = require('./utils/compressor');

module.exports = {};

module.exports.p = {};

module.exports.getFiles = function(options, cb) {
  readdirp(options, function(err, res) {
    if (Object.keys(module.exports.p).length === 0) {
      module.exports.p = new Precompiler({
        templates: _.map(res.files, function(f) {
          return f.fullPath;
        })
      });
    } else {
      module.exports.p.templates = _.map(res.files, function(f) {
        return f.fullPath;
      });
    }
    
    module.exports.p.templates.push(path.join(__dirname, '..', 'templates', 'clientjs', 'search_result.jade'));
    
    cb();
  });
};

module.exports.run = function(ast) {
  var deferred = Q.defer();

  global.options.debug.log('precompiling templates', 'yellow');
  if (global.options.templates === null) {
    return false;
  }
  
  // figure out where the templates are hiding
  var templateDir = path.join(process.cwd(), global.options.templates);
  module.exports.options = {
    root: templateDir,
    directoryFilter: global.options.ignore_folders,
    fileFilter: global.options.ignore_files
  };
  
  // slice and dice them
  module.exports.getFiles(module.exports.options, function() {
    var buf, cleantoc, output_path, searchContent, toc, precompiler = module.exports.p;
    
    output_path = path.join(process.cwd(), global.options.output_folder, 'js', 'templates', 'main.js');
    mkdirp.sync(path.dirname(output_path));
    
    buf = precompiler.compile();
    if (global.options.compress) {
      buf = compressor(buf, 'js');
    }
    
    fs.writeFileSync(output_path, buf);

    deferred.resolve(ast);
  });

  return deferred.promise;
};

var Precompiler = (function() {
  /**
   * deals with setting up the variables for options
   * @param {Object} options = {} an object holding all the options to be
     passed to the compiler. 'templates' must be specified.
   * @constructor
  */

  function Precompiler(options) {
    var defaults;
    if (options === null) {
      options = {};
    }
    defaults = {
      debug: false,
      namespace: 'templates',
      templates: void 0
    };
    _.extend(this, defaults, options);
  }

  /**
   * loop through all the templates specified, compile them, and add a wrapper
   * @return {String} the source of a JS object which holds all the templates
   * @public
   */


  Precompiler.prototype.compile = function() {
    var buf;
    buf = ['define(function(require){\n'];

    buf.push('  window.jade = require(\'lfa/js/lib/jade-helpers.js\');\n');
    
    if (global.options.mixins) {
      this.initMixins();
      buf.push('  window.jade_mixins = require(\'js/templates/mixins.js\');\n');
    }
    
    buf.push('\n  var ' + this.namespace + ' = {};');
    this.initTemplates(this.templates);
    buf.push('\n  templates = require(\'js/templates/index.js\');');
    buf.push('\n  return ' + this.namespace + ';\n});');
    return buf.join('');
  };

  /**
   * compile individual templates, and write them to their respective files
   * @param {String} template the full filename & path of the template to be
     compiled
   * @return {String} template namespace (e.g.: 'ch01-00') of the template
   * @private
  */


  Precompiler.prototype.compileTemplate = function(template) {
    var basePath, basePathSplit, data, templateNamespace;
    basePath = template.split(path.join(process.cwd(), global.options.templates) + path.sep)[1];
    if (!basePath) {
      basePathSplit = template.split(path.sep);
      basePath = basePathSplit[basePathSplit.length - 1];
    }
    templateNamespace = basePath.split('.jade')[0].replace(/[\/\\]/g, '-');
    data = fs.readFileSync(template, 'utf8');
    
    var compileOptions = {
      compileDebug: this.debug || false,
      inline: this.inline || false,
      self: true,
      pretty: false,
      filename: template,
      basedir: process.cwd()
    };
    
    data = jade.compileClient(data, compileOptions);

    // generate the TOC if template is in /text
    if (template.search(path.join(process.cwd(), global.options.folder_config.views)) == 0)
      toc_generator.add_jade(basePath, templateNamespace, data);
    
    // jade_mixins and buf are declared in window, so keep calm
    data = (data + '')
      .replace(/\nvar jade_mixins = {};\n/, '')
      .replace('var buf = [];', 'window.buf = [];');
    
    var buf = 'define(function(){ return ' + data + '});';
    if (global.options.compress) {
      buf = compressor(buf, 'js');
    }
    
    // write the template to its respective file
    fs.writeFileSync(path.join(process.cwd(), global.options.output_folder, 'js', 'templates', templateNamespace + '.js'), buf);
    
    return templateNamespace;
  };
  
  Precompiler.prototype.initMixins = function() {
    // compile the mixins and remove some needless boilerplate
    var mixins = jade.compileClient(global.options.mixins, { basedir: process.cwd() })
      .replace(';;return buf.join("");\n}', ';\n')
      .replace('function template(locals) {\nvar buf = [];\nvar jade_mixins = {};\n', '')
      .replace(/var locals.*/, '');
    
    var buf = 'define(function() {\n  var jade_mixins = {};' + mixins + '  return jade_mixins;\n});';
    
    if (global.options.compress) {
      buf = compressor(buf, 'js');
    }

    global.options.compiled_mixins = mixins;
    
    fs.writeFileSync(path.join(process.cwd(), global.options.output_folder, 'js', 'templates', 'mixins.js'), buf);
  };
  
  Precompiler.prototype.initTemplates = function(ref) {
    var buf = [];
    
    buf.push('define(function(require) {\n  var templates = {};\n');
    for (var i = 0, len = ref.length; i < len; i++) {
      var templateNamespace = this.compileTemplate(ref[i]);
      buf.push('  ' + this.namespace + '[\'' + templateNamespace + '\'] = require(\'js/templates/' + templateNamespace + '.js\');\n');
    }
    buf.push('  return templates;\n});');
    
    buf = buf.join('');
    
    if (global.options.compress) {
      buf = compressor(buf, 'js');
    }
    
    fs.writeFileSync(path.join(process.cwd(), global.options.output_folder, 'js', 'templates', 'index.js'), buf);
  };

  return Precompiler;

})();
