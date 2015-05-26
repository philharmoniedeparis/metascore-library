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
        sub('src/js/helpers/%s.*.js'),
        sub('src/js/%s.Locale.js'),
        sub('src/js/locale/core/%s.*.js'),
      ],
      PLAYER_LIST = [
        sub('src/js/locale/player/%s.*.js'),
        sub('src/js/%s.Player.js'),
        sub('src/js/player/%s.player.*.js'),
        sub('src/js/player/component/%s.*.js'),
        sub('src/js/player/component/element/%s.*.js'),
        sub('src/js/player/media/%s.*.js'),
      ],
      EDITOR_LIST = [
        sub('src/js/locale/editor/%s.*.js'),
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
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-git-rev-parse');
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
      i18n: ['src/js/locale/*'],
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
    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        options: {
          paths: './src/js',
          outdir: './doc'
        }
      }
    },
    translate_extract: {
      all: {
        src: CORE_LIST.concat(EDITOR_LIST, PLAYER_LIST)
      },
      options: {
        locales: ["en", "fr"],
        outputDir: "src/locale",
        builtInParser: null,
        customParser:  {
          getRegexpList: function(){
            return [/metaScore\.Locale\.t\('(.+?)', ?'(.*?)'/gm];
          },
          parseMatch: function(match){
            return {
              'key': match[1],
              'text': match[2]
            };
          }
        },
        errorOnDuplicatedKeys: false
      }
    },
    translate_copy: {
      all: {
        src: ['src/locale/*.json'],
        dest: "dist/locale/"
      }
    },
    watch: {
      scripts: {
        files: ['Gruntfile.js'].concat('src/**', '!src/locale/**', '!src/js/locale/**'),
        tasks: ['build', 'drupal'],
        options: {
          interrupt: true
        }
      }
    }
  });
  
  // Register tasks
  
  grunt.registerMultiTask('translate_copy', 'Copy translations to javascript', function() {
    var path = require('path'),
      fs = require('fs');
      
    this.files.forEach(function(file){
      file.src.forEach(function(f){
        var lang = path.basename(f, '.json'),
          strings = fs.readFileSync(f, 'utf8'),
          dest = file.dest + lang +'.js';
          
        if (!fs.existsSync(file.dest)){
          fs.mkdirSync(file.dest);
        }
        
        fs.writeFileSync(dest, 'var metaScoreLocale = '+ strings +';\n');
      });
    });
  });
  
  grunt.registerTask('build', [
    'jshint',
    'clean:dist',
    'translate_extract',
    'concat:player',
    'concat:editor',
    'uglify:dist',
    'concat:player-dev',
    'concat:editor-dev',
    'git-rev-parse',
    'replace',
    'less',
    'copy:dist',
    'translate_copy'
  ]);
  
  grunt.registerTask('test', [
    'qunit'
  ]);
  
  grunt.registerTask('doc', [
    'yuidoc'
  ]);
  
  grunt.registerTask('drupal', [
    'clean:drupal',
    'copy:drupal'
  ]);
  
  grunt.registerTask('default', [
    'build'
  ]);
};
