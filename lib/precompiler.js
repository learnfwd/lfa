var jade = require('jade'),
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    mkdirp = require('mkdirp'),
    minimatch = require('minimatch'),
    readdirp = require('readdirp'),
    compressor = require('./utils/compressor');

module.exports = function() {
  var options, template_dir;
  global.options.debug.log('precompiling templates', 'yellow');
  if (!(global.options.templates != null)) {
    return false;
  }
  template_dir = path.join(process.cwd(), global.options.templates);
  options = {
    root: template_dir,
    directoryFilter: global.options.ignore_folders,
    fileFilter: global.options.ignore_files
  };
  return readdirp(options, function(err, res) {
    var buf, cleantoc, output_path, precompiler, search_content, toc;
    precompiler = new Precompiler({
      templates: _.map(res.files, function(f) {
        return f.fullPath;
      })
    });
    precompiler.templates.push(path.join(__dirname, '..', 'templates/clientjs/search_result.jade'));
    buf = precompiler.compile();
    if (global.options.compress) {
      buf = compressor(buf, 'js');
    }
    output_path = path.join(process.cwd(), global.options.output_folder, '/js/templates.js');
    mkdirp.sync(path.dirname(output_path));
    fs.writeFileSync(output_path, buf);
    search_content = global.options.search_content;
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
    global.options.debug.log(require('util').inspect(toc, false, null), "yellow");
    search_content = 'define({ pages: ' + JSON.stringify(search_content) + ', toc: ' + JSON.stringify(toc) + '});';
    fs.writeFileSync('_build/js/searchjson.js', search_content);
    return global.options.debug.log('generated js/searchjson.js', 'yellow');
  });
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
    if (options == null) {
      options = {};
    }
    defaults = {
      include_helpers: true,
      inline: false,
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
    var buf, template, _i, _len, _ref;
    buf = ["define(function(){\n  var " + this.namespace + " = {};\n  " + (this.include_helpers !== false && this.inline !== true ? this.helpers() : void 0)];
    _ref = this.templates;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      template = _ref[_i];
      buf.push(this.compileTemplate(template).toString());
    }
    buf.push('; return templates;});');
    return buf.join('');
  };

  /**
   * compile individual templates
   * @param {String} template the full filename & path of the template to be
     compiled
   * @return {String} source of the template function
   * @private
  */


  Precompiler.prototype.compileTemplate = function(template) {
    var basePath, basePathSplit, data, templateNamespace;
    basePath = template.split(path.join(process.cwd(), global.options.templates) + "/")[1];
    if (!basePath) {
      basePathSplit = template.split('/');
      basePath = basePathSplit[basePathSplit.length - 1];
    }
    templateNamespace = basePath.split('.jade')[0].replace(/\//g, '-');
    data = fs.readFileSync(template, 'utf8');
    if (global.options.mixins) {
      data = global.options.mixins + "\n" + data;
    }
    data = jade.compile(data, {
      compileDebug: this.debug || false,
      inline: this.inline || false,
      client: true,
      self: true
    });
    return "" + this.namespace + "['" + templateNamespace + "'] = " + data + ";\n";
  };

  /**
   * Gets Jade's helpers and combines them into string
   * @return {String} source of Jade's helpers
   * @private
  */


  Precompiler.prototype.helpers = function() {
    var buf, joinClasses, nulls;
    nulls = function nulls(val) { return val != null && val !== '' };
    joinClasses = function joinClasses(val) { return Array.isArray(val) ? val.map(joinClasses).filter(nulls).join(' ') : val; };
    buf = [jade.runtime.attrs.toString().replace(/exports\./g, ''), jade.runtime.escape.toString(), nulls.toString(), joinClasses.toString()];
    if (this.debug) {
      buf.push(jade.runtime.rethrow.toString());
    }
    buf.push("var jade = {\n  attrs: attrs,\n  escape: escape " + (this.debug ? ',\n  rethrow: rethrow' : '') + "\n};");
    return buf.join('\n');
  };

  return Precompiler;

})();
