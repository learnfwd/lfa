var jade = require('jade'),
  fs = require('fs'),
  path = require('path'),
  _ = require('underscore'),
  mkdirp = require('mkdirp'),
  readdirp = require('readdirp'),
  Q = require('q'),
  toc_generator = require('./toc_generator'),
  compressor = require('./utils/compressor'),
  precompilers = [ require('./precompilers/jade') ];

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
    var buf, output_path, precompiler = module.exports.p;
    
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

    for (var i = 0; i < precompilers.length; i++) {
      precompilers[i].init(buf);
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


  Precompiler.prototype.compileTemplate = function(template, isChapter) {
    var basePath, basePathSplit, data, templateNamespace;
    basePath = template.split(path.join(process.cwd(), global.options.templates) + path.sep)[1];
    if (!basePath) {
      basePathSplit = template.split(path.sep);
      basePath = basePathSplit[basePathSplit.length - 1];
    }

    var idx = basePath.search(/\.[^\.]*$/);
    var extension = '';
    if (idx === -1) {
      templateNamespace = basePath.replace(/[\/\\]/g, '-');
    } else {
      extension = basePath.substr(idx+1);
      templateNamespace = basePath.substr(0, idx).replace(/[\/\\]/g, '-');
    } 

    data = fs.readFileSync(template, 'utf8');

    var precompiler = null;
    for (var i = 0; i < precompilers.length; i++) {
      var pre = precompilers[i];
      if (pre.settings.file_type === extension) {
        precompiler = pre;
        break;
      }
    }

    if (precompiler) {
      data = precompiler.compile(template, data, this);
    } else {
      var oldData = data;
      data = 'function () { return ' + data + '; }';
    }

    // generate the TOC if template is in /text
    if (isChapter) {
      var locals = {url: templateNamespace};
      var html;
      if (precompiler) {
        html = precompiler.call(data, locals);
      } else {
        html = oldData;
      }

      toc_generator.add_toc_item(basePath, locals);
      toc_generator.add_search_item(basePath, locals, html);
    }
    
    var buf = (isChapter ? 'asyncDefine(\'' + templateNamespace + '\', ' : 'define(') + 'function(){ return ' + data + '});';

    if (global.options.compress) {
      buf = compressor(buf, 'js');
    }
    
    // write the template to its respective file
    fs.writeFileSync(path.join(process.cwd(), global.options.output_folder, 'js', 'templates', templateNamespace + '.js'), buf);
    
    return templateNamespace;
  };
  
  Precompiler.asyncBoilerplate = [
    '  var async = {};',
    '  var templates = {};',
    '  ',
    '  window.asyncDefine = function (key, fn) {',
    '    var opts = async[key];',
    '    opts.loading = false;',
    '    opts.loaded = true;',
    '    var value = fn();',
    '    templates[key] = value;',
    '    for (var i = 0, n = opts.callbacks.length; i < n; i++) {',
    '      opts.callbacks[i](null, value);',
    '    }',
    '    opts.callbacks.length = 0;',
    '  };',
    '  ',
    '  templates.asyncLoad = function (key, callback) {',
    '    var opts = async[key];',
    '    if (opts.loaded) {',
    '      callback(null, templates[key]);',
    '    } else {',
    '      opts.callbacks.push(callback);',
    '      if (!opts.loading) {',
    '        opts.loading = true;',
    '        var script = document.createElement(\'script\');',
    '        script.src = opts.src;',
    '        document.head.appendChild(script);',
    '      }',
    '    }',
    '  };',
    '  ',
    '  templates.removeLoaded = function (key) {',
    '    var opts = async[key];',
    '    if (opts.loaded) {',
    '      templates[key] = undefined;',
    '    } else if (opts.loading) {',
    '      for (var i = 0, n = opts.callbacks.length; i < n; i++) {',
    '        opts.callbacks[i](new Error(\'Loading cancelled\'), null);',
    '      }',
    '    }',
    '  };',
    '  ',
    '  function register(key, src) {',
    '    async[key] = {',
    '      src: src,',
    '      callbacks: []',
    '    };',
    '  };',
    '',
    ''
  ].join('\n');

  
  Precompiler.prototype.initTemplates = function(ref) {
    var buf = [];
    
    buf.push('define(function(require) {\n');
    buf.push(Precompiler.asyncBoilerplate);
    for (var i = 0, len = ref.length; i < len; i++) {
      var isChapter = ref[i].search(path.join(process.cwd(), global.options.folder_config.views)) === 0;
      var templateNamespace = this.compileTemplate(ref[i], isChapter);
      if (isChapter) {
        buf.push('  register(\'' + templateNamespace + '\', \'js/templates/' + templateNamespace + '.js\');\n');
      } else {
        buf.push('  ' + this.namespace + '[\'' + templateNamespace + '\'] = require(\'js/templates/' + templateNamespace + '.js\');\n');
      }
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
