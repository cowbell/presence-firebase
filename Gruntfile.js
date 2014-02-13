'use strict';

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  grunt.config.init({

    // Asks about stuff
    prompt: {
      target: {
        options: {
          questions: [{
            config: 'firebase_url',
            type: 'input',
            message: 'Firebase URL',
            validate: function (value) {
              return value.trim() === "" ? "It can't be blank" : true;
            },
            filter:  function (value) {
              return value.replace(/\/$/, ""); // remove trailing slash
            }
          }, {
            config: 'firebase_secret',
            type: 'password',
            message: 'Firebase secret',
            validate: function (value) {
              return value.trim() === "" ? "It can't be blank" : true;
            }
          }, {
            config: 'custom_domain',
            type: 'input',
            message: 'Custom domain (optional)'
          }]
        }
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: ['dist/*']
        }]
      }
    },

    // Replaces code in files and moves them around
    'string-replace': {
      dist: {
        files: {
          'dist/js/app.js': 'app/js/app.js',
          'scan_macs_dist.sh': 'scan_macs.sh'
        },

        options: {
          replacements: [{
            pattern: /<!-- @config (.*?) -->/ig,
            replacement: function (match, p1, offset, string) {
              return grunt.config.get(p1);
            }
          }]
        }
      }
    },

    // Copies remaining files
    copy: {
      dist: {
        files: [{
          expand: true,
          cwd: 'app',
          dest: 'dist',
          src: [
            'css/**/*',
            'index.html'          ]
        }]
      }
    },

    build_gh_pages: {
      gh_pages: {
        options: {
          pull: false
        }
      }
    }
  });

  grunt.registerTask('generate-firebase-auth-token', 'Generate Firebase auth token from secret', function () {
    var secret = grunt.config.get('firebase_secret');
    var FirebaseTokenGenerator = require("firebase-token-generator");
    var tokenGenerator = new FirebaseTokenGenerator(secret);
    var token = tokenGenerator.createToken({}, {expires: 32503680000}); // 01.01.3000 00:00

    grunt.config.set('firebase_auth_token', token);
  });

  grunt.registerTask('generate-config-file', 'Generate config.json file', function () {
    var config = {
      firebase_url: grunt.config.get('firebase_url'),
      firebase_auth_token: grunt.config.get('firebase_auth_token'),
      custom_domain: grunt.config.get('custom_domain')
    };

    grunt.file.write('config.json', JSON.stringify(config, null, '\t'));
  });

  grunt.registerTask('read-config-file', 'Read config.json file', function () {
    var config = grunt.file.readJSON('config.json');
    grunt.config.set('firebase_url', config.firebase_url);
    grunt.config.set('firebase_auth_token', config.firebase_auth_token);
    grunt.config.set('custom_domain', config.custom_domain);
  });

  grunt.registerTask('generate-cname-file', 'Generate CNAME file (for GitHub Pages)', function () {
    var domain = grunt.config.get('custom_domain');

    if (domain) {
      grunt.file.write('dist/CNAME', domain);
      grunt.log.ok('Generated dist/CNAME file with "' + domain + '" domain.');
    } else {
      grunt.log.ok('Couldn\'t find "custom_domain" configuration - skipping generation of dist/CNAME file.');
    }
  });

  grunt.registerTask('build', [
    'clean',
    'read-config-file',
    'generate-cname-file',
    'string-replace',
    'copy'
  ]);

  grunt.registerTask('setup', [
    'prompt',
    'generate-firebase-auth-token',
    'generate-config-file',
    'build'
  ]);

  grunt.registerTask('deploy', [
    'build',
    'build_gh_pages'
  ]);

  grunt.registerTask('default', [
    'setup'
  ]);
};
