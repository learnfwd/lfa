module.exports = function(grunt) {
  grunt.initConfig({
    phantomcss: {
      largeUX: {
        options: {
          screenshots: 'test/screenshots/ux/large/',
          results: 'test/results/ux/large',
          viewportSize: [1200, 800]
        },
        src: ['test/ux.js']
      },
      mediumUX: {
        options: {
          screenshots: 'test/screenshots/ux/medium/',
          results: 'test/results/ux/medium',
          viewportSize: [991, 800]
        },
        src: ['test/ux.js']
      },
      smallUX: {
        options: {
          screenshots: 'test/screenshots/ux/small/',
          results: 'test/results/ux/small',
          viewportSize: [767, 480]
        },
        src: ['test/ux.js']
      },
      xsmallUX: {
        options: {
          screenshots: 'test/screenshots/ux/xsmall/',
          results: 'test/results/ux/xsmall',
          viewportSize: [320, 480]
        },
        src: ['test/ux.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-phantomcss');

  grunt.registerTask('default', ['phantomcss']);
};