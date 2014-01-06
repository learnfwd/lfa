module.exports = function(grunt) {
  grunt.initConfig({
    phantomcss: {
      large: {
        options: {
          screenshots: 'test/screenshots/large/',
          results: 'test/results/large',
          viewportSize: [1200, 800]
        },
        src: ['test/test.js']
      },
      medium: {
        options: {
          screenshots: 'test/screenshots/medium/',
          results: 'test/results/medium',
          viewportSize: [991, 800]
        },
        src: ['test/test.js']
      },
      small: {
        options: {
          screenshots: 'test/screenshots/small/',
          results: 'test/results/small',
          viewportSize: [767, 480]
        },
        src: ['test/test.js']
      },
      xsmall: {
        options: {
          screenshots: 'test/screenshots/xsmall/',
          results: 'test/results/xsmall',
          viewportSize: [320, 480]
        },
        src: ['test/test.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-phantomcss');

  grunt.registerTask('default', ['phantomcss']);

};