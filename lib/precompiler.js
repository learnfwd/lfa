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
    var buf, i , ref, n;
    buf = ['define(function(require){\n'];

    for (i = 0; i < precompilers.length; i++) {
      precompilers[i].init(buf);
    }
    
    buf.push('\n  var ' + this.namespace + ' = {};');
    buf.push('\n  templates = require(\'js/templates/index.js\');');
    buf.push('\n  return ' + this.namespace + ';\n});');

    this.initTemplates(this.templates);

    for (i = 0, ref = this.templates, n = ref.length; i < n; i++) {
      this.compileTemplate(ref[i]);
    }

    return buf.join('');
  };

  Precompiler.prototype.parseTemplateFileName = function(template) {
    // Prefix is used by cssNamespace to create a series of CSS classes
    // to apply to the main <body> element.
    var prefix = 'lf-';
    
    var basePath, basePathSplit, templateNamespace, cssNamespace;
    basePath = template.split(path.join(process.cwd(), global.options.templates) + path.sep)[1];
    if (!basePath) {
      basePathSplit = template.split(path.sep);
      basePath = basePathSplit[basePathSplit.length - 1];
    }

    var idx = basePath.search(/\.[^\.]*$/);
    var extension = '';
    if (idx === -1) {
      templateNamespace = basePath.replace(/[\/\\]/g, '-');
      cssNamespace = basePath.replace(/[\/\\]/g, ' ');
    } else {
      extension = basePath.substr(idx+1);
      templateNamespace = basePath.substr(0, idx).replace(/[\/\\]/g, '-');
      cssNamespace = basePath.substr(0, idx).replace(/[\/\\]/g, ' ' + prefix);
    }
    // cssNamespace is a series of CSS classes to apply to the <body> element.
    cssNamespace = prefix + cssNamespace;

    return {
      extension: extension,
      namespace: templateNamespace,
      cssNamespace: cssNamespace,
      basePath: basePath,
      fileName: template,
      isChapter: template.search(path.join(process.cwd(), global.options.folder_config.views)) === 0
    };
  };

  /**
   * compile individual templates, and write them to their respective files
   * @param {String/Object} template the full filename & path of the template to be
     compiled or a dictionary with the parsed file name
   * @private
  */


  Precompiler.prototype.compileTemplate = function(opts) {
    if (typeof(opts) === 'string') {
      opts = this.parseTemplateFileName(opts);
    }

    var data = fs.readFileSync(opts.fileName, 'utf8');

    var precompiler = null;
    for (var i = 0; i < precompilers.length; i++) {
      var pre = precompilers[i];
      if (pre.settings.file_type === opts.extension) {
        precompiler = pre;
        break;
      }
    }

    if (precompiler) {
      data = precompiler.compile(opts.fileName, data, this);
    } else {
      var oldData = data;
      data = 'function () { return ' + data + '; }';
    }

    // generate the TOC if template is in /text
    if (opts.isChapter) {
      var locals = {
        url: opts.namespace,
        cssNamespace: opts.cssNamespace
      };
      var html;
      if (precompiler) {
        html = precompiler.call(data, locals);
      } else {
        html = oldData;
      }

      toc_generator.add_toc_item(opts.basePath, locals);
      toc_generator.add_search_item(opts.basePath, locals, html);
    }
    
    var buf = (opts.isChapter ? 'asyncDefine(\'' + opts.namespace + '\', ' : 'define(') + 'function(){ return ' + data + '});';

    if (global.options.compress) {
      buf = compressor(buf, 'js');
    }
    
    // write the template to its respective file
    fs.writeFileSync(path.join(process.cwd(), global.options.output_folder, 'js', 'templates', opts.namespace + '.js'), buf);
  };
  
  Precompiler.asyncBoilerplate = [
    '  var async = {};',
    '  var templates = {};',
    '  ',
    '  window.asyncDefine = function (key, fn) {',
    '    var opts = async[key];',
    '    if (!opts.loading) return;',
    '    opts.loading = false;',
    '    opts.loaded = true;',
    '    var value = fn()();',
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
    '        opts.element = script;',
    '        document.head.appendChild(script);',
    '      }',
    '    }',
    '  };',
    '  ',
    '  templates.templateExists = function (key) {',
    '    return async[key] !== undefined || templates[key] !== undefined;',
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
    '    if (opts.element) {',
    '      document.head.removeChild(opts.element);',
    '      opts.element = null;',
    '    }',
    '    opts.loading = opts.loaded = false;',
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
      var opts = this.parseTemplateFileName(ref[i]);
      if (opts.isChapter) {
        buf.push('  register(\'' + opts.namespace + '\', \'js/templates/' + opts.namespace + '.js\');\n');
      } else {
        buf.push('  ' + this.namespace + '[\'' + opts.namespace + '\'] = require(\'js/templates/' + opts.namespace + '.js\');\n');
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
