module.exports = function(grunt) {

  // Helper methods
  function sub(str) {
    return str.replace(/%s/g, LIBRARY_NAME);
  }

  // Helper variables
  var LIBRARY_NAME = 'metaScore',
      CORE_LIST = [
        sub('src/js/%s.polyfill.js'),
        sub('src/js/%s.core.js'),
        sub('src/js/%s.Class.js'),
        sub('src/js/%s.Evented.js'),
        sub('src/js/helpers/%s.*.js')
      ],
      PLAYER_LIST = [
        sub('src/js/%s.Player.js'),
        sub('src/js/player/%s.player.*.js'),
        sub('src/js/player/component/%s.*.js'),
        sub('src/js/player/component/element/%s.*.js'),
        sub('src/js/player/media/%s.*.js'),
      ],
      EDITOR_LIST = [
        sub('src/js/%s.Editor.js'),
        sub('src/js/editor/%s.editor.*.js'),
        sub('src/js/editor/field/%s.*.js'),
        sub('src/js/editor/panel/%s.*.js'),
        sub('src/js/editor/overlay/%s.*.js'),
        sub('src/js/editor/overlay/popup/%s.*.js')
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
      BANNER = '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> - <%= pkg.author %> */\n';


  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-git-rev-parse');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-translate-extract');

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
      drupal: ['../Drupal.git/sites/default/libraries/metaScore'],
      options: {
        force: true
      }
    },
    concat: {
      'player': {
        src: DIST_HEAD_LIST.concat(CORE_LIST, PLAYER_LIST, TAIL_LIST),
        dest: sub('dist/%s.player.js')
      },
      'editor': {
        src: DIST_HEAD_LIST.concat(EDITOR_LIST, TAIL_LIST),
        dest: sub('dist/%s.editor.js')
      },
      'player-dev': {
        src: DEV_HEAD_LIST.concat(CORE_LIST, PLAYER_LIST, TAIL_LIST),
        dest: sub('dist/%s.player.js')
      },
      'editor-dev': {
        src: DEV_HEAD_LIST.concat(EDITOR_LIST, TAIL_LIST),
        dest: sub('dist/%s.editor.js')
      },
      'options': {
        banner: BANNER
      }
    },
    'git-rev-parse': {
      all: {},
      options: {
        prop: 'git.revision'
      }
    },
    replace: {
      tokens: {
        src: sub('dist/*.js'),
        overwrite: true,
        replacements: [
          {
            from: "[[VERSION]]",
            to: "<%= pkg.version %>"
          },
          {
            from: "[[REVISION]]",
            to: "<%= git.revision %>"
          }
        ]
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
          'dist/metaScore.editor.min.js': 'dist/metaScore.editor.js'
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
            dest: '../Drupal.git/sites/default/libraries/metaScore'
          }
        ]
      }
    },
    qunit: {
      all: ['test/index.html']
    },
    jsdoc: {
      all: {
        src:  CORE_LIST.concat(EDITOR_LIST, PLAYER_LIST),
        options: {
          destination: 'doc'
        }
      }
    },
    translate_extract: {
      player: {
        src: PLAYER_LIST,
        options: {
          outputExtension: ".player.json"
        }
      },
      editor: {
        src: EDITOR_LIST,
        options: {
          outputExtension: ".editor.json"
        }
      },
      options: {
        locales: ["en", "fr"],
        outputDir: "src/locale",
        builtInParser: null,
        customParser:  {
          getRegexpList: function(){
            return [/metaScore\.String\.t\('(.*)'/gm];
          },
          parseMatch: function(match){
            console.log(match);
            return {
              'key': match[1],
              'text': match[1]
            };
          }        
        },
        errorOnDuplicatedKeys: false
      }
    },
    watch: {
      scripts: {
        files: ['Gruntfile.js'].concat('src/**'),
        tasks: ['build', 'drupal'],
        options: {
          interrupt: true
        }
      }
    }
  });
  
  // Register tasks
  
  grunt.registerTask('build', [
    'jshint',
    'clean:dist',
    'concat:player',
    'concat:editor',
    'uglify:dist',
    'concat:player-dev',
    'concat:editor-dev',
    'git-rev-parse',
    'replace',
    'less',
    'copy:dist'
  ]);
  
  grunt.registerTask('test', [
    'qunit'
  ]);
  
  grunt.registerTask('drupal', [
    'clean:drupal',
    'copy:drupal'
  ]);
  
  grunt.registerTask('default', [
    'build'
  ]);
};
