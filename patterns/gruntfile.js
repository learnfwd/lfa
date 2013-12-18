module.exports = function(grunt) {
  grunt.initConfig({
    phantomcss: {
      options: {},
      your_target: {
        options: {
          screenshots: 'spec/visual/screenshots/',
          results: 'spec/results/visual/',
          viewportSize: [320, 480]
        },
        src: [
          'spec/visual/**/*.js'
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-phantomcss');

  grunt.registerTask('default', ['phantomcss']);

};