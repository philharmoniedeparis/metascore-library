/*global module:false*/
module.exports = function(grunt) {

  // Helper methods
  function sub(str) {
    return str.replace(/%s/g, LIBRARY_NAME);
  }

  // Helper variables
  var LIBRARY_NAME = 'metaScore',  
      MODULE_LIST = [
        sub('src/helpers/%s.var.js'),
        sub('src/helpers/%s.string.js'),
        sub('src/helpers/%s.object.js'),
        sub('src/helpers/%s.array.js'),
        sub('src/helpers/%s.function.js'),
        sub('src/helpers/%s.ajax.js'),
        sub('src/helpers/%s.class.js'),
        sub('src/helpers/%s.dom.js')
      ],
      DIST_HEAD_LIST = [
        sub('src/%s.intro.js'),
        sub('src/%s.const.js'),
        sub('src/%s.core.js')
      ],
      DEV_HEAD_LIST = [
        sub('src/%s.intro.js'),
        sub('src/%s.core.js')
      ],
      TAIL_LIST = [
        sub('src/%s.outro.js')
      ],
      BANNER = '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> - <%= pkg.author %> */\n';

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-text-replace');

  // Configure grunt
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      dist: {
        options: {
          banner: BANNER
        },
        src: DIST_HEAD_LIST.concat(MODULE_LIST, TAIL_LIST),
        dest: sub('dist/%s.js')
      },
      dev: {
        options: {
          banner: BANNER
        },
        src: DEV_HEAD_LIST.concat(MODULE_LIST, TAIL_LIST),
        dest: sub('dist/%s.js')
      }
    },
    replace: {
      all: {
        src: sub('dist/*.js'),
        overwrite: true,
        replacements: [{
          from: "[[VERSION]]",
          to: "<%= pkg.version %>"
        }]
      }
    },
    uglify: {
      dist: {
        files: (function () {
            // Using an IIFE so that the destination property name can be
            // created dynamically with sub().
            var obj = {};
            obj[sub('dist/%s.min.js')] = [sub('dist/%s.js')];
            return obj;
          } ())
      },
      options: {
        banner: BANNER
      }
    },
    qunit: {
      all: ['test/index.html']
    },
    jshint: {
      all: [
        'Gruntfile.js',
        sub('src/**/%s.!(intro|outro|const)*.js')
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    }
  });
  
  // Register tasks
  grunt.registerTask('default', [
    'build',
    'test'
  ]);
  
  grunt.registerTask('build', [
    'jshint',
    'concat:dist',
    'uglify:dist',
    'concat:dev',
    'replace'
  ]);
  
  grunt.registerTask('test', [
    'qunit'
  ]);
};
