module.exports = function(grunt) {
  grunt.initConfig({
    phantomcss: {
      // large: {
      //   options: {
      //     screenshots: 'test/css/screenshots/large/',
      //     results: 'test/results/css/large',
      //     viewportSize: [1200, 800]
      //   },
      //   src: ['test/css/test.js']
      // },
      // medium: {
      //   options: {
      //     screenshots: 'test/css/screenshots/medium/',
      //     results: 'test/results/css/medium',
      //     viewportSize: [991, 800]
      //   },
      //   src: ['test/css/test.js']
      // },
      // small: {
      //   options: {
      //     screenshots: 'test/css/screenshots/small/',
      //     results: 'test/results/css/small',
      //     viewportSize: [767, 480]
      //   },
      //   src: ['test/css/test.js']
      // },
      xsmall: {
        options: {
          screenshots: 'test/css/screenshots/xsmall/',
          results: 'test/results/css/xsmall',
          viewportSize: [320, 480]
        },
        src: ['test/css/test.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-phantomcss');

  grunt.registerTask('css', ['phantomcss']);

};