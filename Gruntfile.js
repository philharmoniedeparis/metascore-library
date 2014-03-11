/*global module:false*/
module.exports = function(grunt) {

  // Helper methods
  function sub (str) {
    return str.replace(/%s/g, LIBRARY_NAME);
  }

  function wrapModules (head, tail) {
    return head.concat(MODULE_LIST).concat(tail);
  }

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // You will want to chage the value of this constant to whatever your library
  // is called.
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  var LIBRARY_NAME = 'metaScore';

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // Add your modules to this list
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  var MODULE_LIST = [
      sub('src/%s.class.js'),
      sub('src/helpers/%s.function.js'),
      sub('src/helpers/%s.string.js'),
      sub('src/helpers/%s.array.js'),
      sub('src/helpers/%s.dom.js')
    ];

  var DIST_HEAD_LIST = [
      sub('src/%s.intro.js'),
      sub('src/%s.const.js'),
      sub('src/%s.core.js')
    ];

  // This is the same as DIST_HEAD_LIST, just without *.const.js (which is just
  // there UglifyJS conditional compilation).
  var DEV_HEAD_LIST = [
      sub('src/%s.intro.js'),
      sub('src/%s.core.js')
    ];

  var TAIL_LIST = [
      sub('src/%s.outro.js')
    ];

  // Gets inserted at the top of the generated files in dist/.
  var BANNER = [
      '/*! <%= pkg.name %> - v<%= pkg.version %> - ',
      '<%= grunt.template.today("yyyy-mm-dd") %> - <%= pkg.author %> */\n'
    ].join('');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-text-replace');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      dist: {
        options: {
          banner: BANNER
        },
        src: wrapModules(DIST_HEAD_LIST, TAIL_LIST),
        dest: sub('dist/%s.js')
      },
      dev: {
        options: {
          banner: BANNER
        },
        src: wrapModules(DEV_HEAD_LIST, TAIL_LIST),
        dest: sub('dist/%s.js')
      }
    },
    replace: {
      all: {
        src: sub('dist/%s.js'),
        overwrite: true,
        replacements: [{
          from: "[[VERSION]}",
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
      files: ['test/qunit*.html']
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

  grunt.registerTask('default', [
      'build',
      'qunit'
    ]);
  grunt.registerTask('build', [
      'jshint',
      'concat:dist',
      'replace',
      'uglify:dist',
      'concat:dev',
      'replace'
    ]);
};
