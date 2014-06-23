/*global module:false*/
module.exports = function(grunt) {

  // Helper methods
  function sub(str) {
    return str.replace(/%s/g, LIBRARY_NAME);
  }

  // Helper variables
  var LIBRARY_NAME = 'metaScore',  
      MODULE_LIST = [
        sub('src/js/%s.base.js'),
        sub('src/js/helpers/%s.*.js'),
        sub('src/js/media/%s.*.js'),
        sub('src/js/player/%s.*.js'),
        sub('src/js/editor/%s.editor.js'),
        sub('src/js/editor/%s.editor.*.js'),
        sub('src/js/editor/*/%s.*.js')
      ],
      DIST_HEAD_LIST = [
        sub('src/js/%s.intro.js'),
        sub('src/js/%s.const.js'),
        sub('src/js/%s.core.js')
      ],
      DEV_HEAD_LIST = [
        sub('src/js/%s.intro.js'),
        sub('src/js/%s.core.js')
      ],
      TAIL_LIST = [
        sub('src/js/%s.outro.js')
      ],
      BANNER = '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> - <%= pkg.author %> */\n';

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-text-replace');

  // Configure grunt
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      dist: ['dist']
    },
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
    less: {
      editor: {
        options: {
          yuicompress: true,
          optimization: 2
        },
        files: {
          "dist/metaScore-editor.css": "src/css/metaScore.editor.less"
        }
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
    copy: {
      imges: {
        files: [
          {
            expand: true,
            cwd:'src/',
            src: ['img/**'],
            dest: 'dist/'
          }
        ]
      }
    },
    qunit: {
      all: ['test/index.html']
    },
    jshint: {
      all: ['Gruntfile.js'].concat(MODULE_LIST),
      options: {
        jshintrc: '.jshintrc'
      }
    },
    watch: {
      scripts: {
        files: ['src/**'],
        tasks: ['build'],
        options: {
          interrupt: true
        }
      }
    }
  });
  
  // Register tasks
  grunt.registerTask('default', [
    'build'
    //'test'
  ]);
  
  grunt.registerTask('build', [
    'jshint',
    'clean:dist',
    'concat:dist',
    'uglify:dist',
    'concat:dev',
    'replace',
    'less',
    'copy'
  ]);
  
  grunt.registerTask('test', [
    'qunit'
  ]);
};
