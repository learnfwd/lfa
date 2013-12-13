var stylus = require('stylus'),
    autoprefixer = require('autoprefixer');

exports.settings = {
  file_type: 'styl',
  target: 'css'
};

exports.compile = function(file, cb){
  var css_library = options.css_library;
  var error, compiled;

  stylus(file.contents)
    .set('filename', file.path)
    .set('compress', global.options.compress)
    .include(require('path').dirname(file.path))
    .use(css_library())
    .render(function(err, compiled_css){
      if (err) { error = err; }
      compiled = compiled_css;
    });
  
  compiled = autoprefixer().compile(compiled);
  
  cb(error, compiled);
};
