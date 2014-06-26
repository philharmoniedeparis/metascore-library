module.exports = function(grunt) {

  // Helper methods
  function sub(str) {
    return str.replace(/%s/g, LIBRARY_NAME);
  }

  // Helper variables
  var LIBRARY_NAME = 'metaScore',
      CORE_LIST = [
        sub('src/js/%s.core.js'),
        sub('src/js/%s.base.js')
      ],
      PLAYER_LIST = [
        'src/js/player/*.js'
      ],
      EDITOR_LIST = [
        'src/js/editor/*.js'
      ],
      DEV_HEAD_LIST = [
        sub('src/js/%s.const.js'),
        sub('src/js/%s.intro.js')
      ],
      DIST_HEAD_LIST = [
        sub('src/js/%s.intro.js')
      ],
      TAIL_LIST = [
        sub('src/js/%s.outro.js')
      ],
      BANNER = '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> - <%= pkg.author %> */\n',
      path = require('path');

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-concat-in-order');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-file-append');

  // Configure grunt
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['Gruntfile.js'].concat('src/js/*'),
      options: {
        jshintrc: '.jshintrc'
      }
    },
    clean: {
      dist: ['dist/*'],
      drupal: ['../Drupal/sites/default/libraries/metaScore'],
      options: {
        force: true
      }
    },
    concat_in_order: {
      dist: {    
        files: {
          'dist/metaScore.player.js': DIST_HEAD_LIST.concat(CORE_LIST, PLAYER_LIST, TAIL_LIST),
          'dist/metaScore.editor.js': DIST_HEAD_LIST.concat(CORE_LIST, PLAYER_LIST, EDITOR_LIST, TAIL_LIST)
        }
      },
      dev: {    
        files: {
          'dist/metaScore.player.js': DEV_HEAD_LIST.concat(CORE_LIST, PLAYER_LIST, TAIL_LIST),
          'dist/metaScore.editor.js': DEV_HEAD_LIST.concat(CORE_LIST, PLAYER_LIST, EDITOR_LIST, TAIL_LIST)
        }
      },
      options: {
        extractRequired: function(filepath, filecontent) {
          var workingdir, deps, dependency;
            
          workingdir = path.normalize(filepath).split(path.sep);                  
          workingdir.pop();

          deps = this.getMatches(/\*\s*@requires\s(.*\.js)/g, filecontent);
          deps.forEach(function(dep, i) {
            dependency = workingdir.concat([dep]);
            deps[i] = path.join.apply(null, dependency);
          });
          
          return deps;
        },
        extractDeclared: function(filepath) {
          return [path.normalize(filepath)];
        },
        onlyConcatRequiredFiles: true
      }
    },
    file_append: {
      dev: {
        files: {
          'dist/metaScore.player.js': {
            prepend: BANNER,
            input: 'dist/metaScore.player.js'
          },
          'dist/metaScore.editor.js': {
            prepend: BANNER,
            input: 'dist/metaScore.editor.js'
          }
        }
      }
    },
    replace: {
      version: {
        src: sub('dist/*.js'),
        overwrite: true,
        replacements: [{
          from: "[[VERSION]]",
          to: "<%= pkg.version %>"
        }]
      }
    },
    less: {
      player: {
        files: {
          "dist/metaScore.player.css": "src/css/metaScore.player.less"
        }
      },
      editor: {
        files: {
          "dist/metaScore.editor.css": "src/css/metaScore.editor.less"
        }
      },
      options: {
        yuicompress: true,
        optimization: 2
      }
    },
    uglify: {
      dist: {
        files: {
          'dist/metaScore.player.min.js': 'dist/metaScore.player.js',
          'dist/metaScore.editor.min.js': 'dist/metaScore.editor.js',
        }
      },
      options: {
        banner: BANNER,        
        compress: {
          global_defs: {
            "DEBUG": false
          },
          dead_code: true
        }
      }
    },
    copy: {
      dist: {
        files: [
          {
            expand: true,
            cwd:'src/',
            src: ['img/**'],
            dest: 'dist/'
          }
        ]
      },
      drupal: {
        files: [
          {
            expand: true,
            cwd:'dist/',
            src: ['**'],
            dest: '../Drupal/sites/default/libraries/metaScore'
          }
        ]
      }
    },
    qunit: {
      all: ['test/index.html']
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
  
  grunt.registerTask('build', [
    'jshint:all',
    'clean:dist',
    'concat_in_order:dist',
    'uglify:dist',
    'concat_in_order:dev',
    'file_append:dev',
    'replace:version',
    'less',
    'copy:dist'
  ]);
  
  grunt.registerTask('test', [
    'qunit'
  ]);
  
  grunt.registerTask('drupal', [
    'build',
    'clean:drupal',
    'copy:drupal'
  ]);
  
  // Register tasks
  grunt.registerTask('default', [
    'build'
    //'test'
  ]);
};
