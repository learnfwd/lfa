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
    },
    shell: {
      lfacompile: {
        options: {
          stdout: true
        },
        command: 'cd test/project/ && ../../../bin/lfa compile --no-compress'
      }
    },
    watch: {
      everything: {
        files: [
          'lfa-*/**/*.*',
          'test/project/css/**/*.*',
          'test/project/text/**/*.*'
        ],
        tasks: ['compile'],
        options: {
          spawn: true
        },
      }
    }
  });

  grunt.loadNpmTasks('grunt-phantomcss');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['phantomcss']);
  grunt.registerTask('compile', ['shell']);
};