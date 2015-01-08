var stylus = require('stylus'),
    autoprefixer = require('autoprefixer');

exports.settings = {
  file_type: 'styl',
  target: 'css'
};

exports.compile = function(file, cb){
  var css_library = options.css_library;

  stylus(file.contents)
    .set('filename', file.path)
    .set('sourcemap', { inline: true })
    //.set('compress', global.options.compress)
    .include(require('path').dirname(file.path))
    .use(css_library())
    .render(function(err, compiled_css){
      if (!err) {
        compiled_css = autoprefixer.process(compiled_css).css;
      }
      cb(err, compiled_css);
    });
};
