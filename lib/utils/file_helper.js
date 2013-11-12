var path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    output_path = require('./output_path'),
    yaml_parser = require('./yaml_parser');

module.exports = function(file){
  f = {};

  // set paths
  f.path = file;
  f.contents = fs.readFileSync(file, 'utf8');
  f.export_path = output_path(file);
  f.extension = path.basename(f.path).split('.')[1];
  f.target_extension = path.basename(f.export_path).split('.')[1];

  // expose public api
  f.parse_dynamic_content = parse_dynamic_content;
  f.set_layout = set_layout;
  f.set_dynamic_locals = set_dynamic_locals;
  f.locals = locals;
  f.write = write;

  return f

  //
  // @api public
  //

  // depends on set_paths
  function parse_dynamic_content(){
    var front_matter_string = yaml_parser.match(f.contents);

    if (front_matter_string) {

      // set up variables
      f.category_name = f.path.replace(process.cwd(),'').split(path.sep)[1];
      options.site = oeq(options.site, {});
      options.site[f.category_name] = oeq(options.site[f.category_name], []);
      f.dynamic_locals = {};

      // load variables from front matter
      var front_matter = yaml_parser.parse(f.contents, { filename: f.file })
      for (var k in front_matter) {
        f.dynamic_locals[k] = front_matter[k];
      }
      
      if (options.folder_config.layouts === 'templates/layouts') {
        // we're using the default layouts
        f.layout_path = path.join(__dirname, '../../' + options.folder_config.layouts, options.layouts.default);
      } else {
        // TODO: implement custom layouts
      }
      f.layout_contents = fs.readFileSync(f.layout_path, 'utf8');
      f.dynamic_locals.url = f.path.replace(process.cwd(), '').replace(/\..*$/, '.html');

      // remove the front matter
      f.contents = f.contents.replace(front_matter_string[0], '');

    } else {
      return false
    }
  }

  // depends on set_paths and parse_dynamic_content
  function set_layout(){

    // make sure a layout actually has to be set
    var layouts_set = Object.keys(global.options.layouts).length > 0;

    if (layouts_set && !f.dynamic_locals) {

      // pull the default layout initially
      var layout = options.layouts.default;
      var rel_file = path.relative(options.folder_config.layouts, file)

      // if there's a custom override, use that instead
      for (var key in options.layouts){
        if (key === rel_file) { layout = options.layouts[key] }
      }
      
      // if there's no match
      if (layout == undefined) {
        return false
      }

      // set the layout path and contents
      
      if (options.folder_config.layouts === 'templates/layouts') {
        // we're using the default layouts
        f.layout_path = path.join(__dirname, '../../' + options.folder_config.layouts, layout);
      } else {
        // TODO: implement custom layouts
      }
      f.layout_contents = fs.readFileSync(f.layout_path, 'utf8');

    } else {
      return false
    }

  }

  function set_dynamic_locals(contents) {
    f.dynamic_locals.contents = contents;
    options.site[f.category_name].push(f.dynamic_locals);
  }

  function locals(extra){
    var locals = _.clone(global.options);

    // add path variable
    locals.path = f.export_path;
    locals.dirname = path.dirname(locals.path);
    
    // path_to_root is what you would have to append to locals.dirname in order to get back to the build root.
    // so, given:
    // locals.dirname: _build/ch01/01/index.html
    // output_folder:  _build/
    // path_to_root would be ../../, because that's how many folders you have to go up in order to get back to the _build root.
    // this variable is used to build smart javascript, image and stylesheet includes that work without any server
    locals.path_to_root = (function() {
      var output_path = path.join(process.cwd(), global.options.output_folder);
      var diff = locals.dirname.replace(output_path, '');
      
      var path_to_root = "";
      if (diff.length) {
        for (var i = 0; i < (diff.split("/").length - 1); i++) {
          path_to_root += "../";
        }
      }
      return path_to_root;
    })();

    // add any extra locals
    for (var key in extra){ locals[key] = extra[key]; }

    // add dynamic locals if needed
    if (f.dynamic_locals) {
      if (extra && extra.hasOwnProperty('yield')){
        f.dynamic_locals.content = extra.yield;
      }
      _.extend(locals, f.dynamic_locals);
    }

    return locals
  }

  function write(write_content){

    // if dynamic and no layout, do write it
    if (f.dynamic_locals && !f.dynamic_locals.layout) {
    
      // if dynamic with content, add the compiled content to the locals
      if (write_content !== ''){
        var category = options.site[f.category_name]
        category[category.length-1].content = write_content;
      }
    }

    // compress if needed
    if (global.options.compress) { write_content = compress(write_content) }

    // write it
    fs.writeFileSync(f.export_path, write_content);
    global.options.debug.log("compiled " + f.path.replace(process.cwd(),''));

  }

  //
  // @api private
  //

  // ?= or ||=, very slightly less painful
  function oeq(a,b){ if (!a) { return b } else { return a }; }

  function compress(write_content){
    return require('./compressor')(write_content, f.target_extension);
  }

}
