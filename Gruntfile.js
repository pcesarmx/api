module.exports = function (grunt) {
	var path = require('path');
	var request = require('request');
	var config = require('./config')().apigateway;

	grunt.initConfig({
		jshint: {
			all: {
				src: [
					'classes/**/*.js', 'v1/**/*.js', 'v1/**/_test.json', 'testserver.js', 'app.js'
				],
			},
			options: {
				force: false
			}
		},
		watch: {
			options: {
				livereload: 12345
			},
			grunt: {
				files: 'Gruntfile.js'
			},
			js: {
				files: [
					'classes/**/*.js', 'v1/**/*.js', 'testserver.js', 'app.js'
				],
				tasks: ['jshint'],
			},
			html: {
				files: [
					'public/index.html'
				]
			},
			public: {
				files: [
					// 'public/**',
					// 'public/admin/**',
				],
			},
			nodemonrestart: {
				files: ['.rebooted'],
			}
		},
		nodemon: {
			options: {
				// cwd: 'API/',
				callback: function (nodemon) {
					nodemon.on('config:update', function () {
						console.log('[nodemon] STARTING BACKEND SERVER'.yellow);
					});
					nodemon.on('restart', function () {
						console.log('[nodemon] SERVER RESTART'.red);
						setTimeout(function () {
							require('fs').writeFileSync('.rebooted', 'rebooted');
						}, 1000);
					});
				}
			},
			sev_backend: {
				script: 'app.js'
			}
		},
		parallel: {
			web: {
				options: {
					stream: true
				},
				tasks: [{
					grunt: true,
					args: ['watch']
				}, {
					grunt: true,
					args: ['nodemon']
				}]
			}
		}
	});

	// Load the plugins that provides the tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-parallel');
	grunt.loadNpmTasks('grunt-open');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-run');

	grunt.log.ok('Starting: ');
	grunt.task.clearQueue();
	grunt.registerTask('admin', [
		'copy'
	]);
	grunt.registerTask('build', [
		'jshint'
	]);
	grunt.registerTask('default', ['build', 'parallel:web']);

};
