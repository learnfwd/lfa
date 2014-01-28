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
      },
      overrides: {
        options: {
          screenshots: 'test/screenshots/overrides/',
          results: 'test/results/overrides',
          viewportSize: [320, 480]
        },
        src: ['test/overrides.js']
      }
    },
    shell: {
      lfacompile: {
        options: {
          stdout: true
        },
        command: 'cd test/projects/ux/ && ../../../../bin/lfa compile --no-compress'
      }
    },
    watch: {
      everything: {
        files: [
          'lfa-*/**/*.*',
          'test/project/css/**/*.*',
          'test/project/text/**/*.*',
          'test/project/js/**/*.*'
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