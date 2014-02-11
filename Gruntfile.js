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
          'dist/js/app.js': 'js/app.js',
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
          dest: 'dist',
          src: [
            'css/**/*',
            'index.html',
            'rules.json',
            'users.json'
          ]
        }]
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
      firebase_auth_token: grunt.config.get('firebase_auth_token')
    };

    grunt.file.write('config.json', JSON.stringify(config, null, '\t'));
  });

  grunt.registerTask('read-config-file', 'Read config.json file', function () {
    var config = grunt.file.readJSON('config.json');
    grunt.config.set('firebase_url', config.firebase_url);
    grunt.config.set('firebase_auth_token', config.firebase_auth_token);
  });

  grunt.registerTask('build', [
    'clean',
    'read-config-file',
    'string-replace',
    'copy'
  ]);

  grunt.registerTask('setup', [
    'prompt',
    'generate-firebase-auth-token',
    'generate-config-file',
    'build'
  ]);

  grunt.registerTask('default', [
    'setup'
  ]);
};
