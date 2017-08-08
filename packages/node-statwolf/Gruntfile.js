module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({
    testFiles: ['test/**/*.test.js'],
    srcFiles: ['lib/**/*.js'],
    allFiles: ['<%= testFiles %>', '<%= srcFiles %>'],

    jshint: {
      unit: {
        files: {
          src: ['<%= allFiles %>']
        }
      }
    },

    mochaTest: {
      unit: {
        options: {
          reporter: 'spec'
        },
        src: ['<%= testFiles %>']
      }
    },

    watch: {
      develop: {
        files: ['<%= allFiles %>'],
        tasks: ['test']
      }
    }
  });

  grunt.registerTask('test', ['jshint:unit', 'mochaTest:unit']);
};
