module.exports = function(grunt) {
  grunt.initConfig({
    phantomcss: {
      options: {},
      your_target: {
        options: {
          screenshots: 'test/css/screenshots/',
          results: 'test/results/css/',
          viewportSize: [320, 480]
        },
        src: [
          'test/css/**/*.js'
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-phantomcss');

  grunt.registerTask('css', ['phantomcss']);

};