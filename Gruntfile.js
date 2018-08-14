module.exports = (grunt) => {
	grunt.initConfig({
		jshint: {
			all: {
				src: [
					'lib/**/*.js', 'classes/**/*.js', 'v1/**/*.js', 'v1/**/_test.json', 'app.js'
				],
			},
			options: {
				force: false,
				esversion: 6
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
					'lib/**/*.js', 'classes/**/*.js', 'v1/**/*.js', 'app.js'
				],
				tasks: ['jshint'],
			},
			html: {
				files: [
					'dist/index.html'
				]
			},
			public: {
				files: [
					// 'dist/**',
					// 'dist/admin/**',
				],
			},
			nodemonrestart: {
				files: ['.rebooted'],
			}
		},
		nodemon: {
			options: {
				// cwd: 'API/',
				callback: (nodemon) => {
					nodemon.on('config:update', () => {
						console.log('[nodemon] STARTING BACKEND SERVER'.yellow);
					});
					nodemon.on('restart', () => {
						console.log('[nodemon] SERVER RESTART'.red);
						setTimeout(() => {
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

	grunt.registerTask('build-api', function () {
		const GruntLambdaDeploy = require('./lib/grunt-lambda-deploy');
		let done = this.async();
		task = new GruntLambdaDeploy(grunt, done, __dirname);
	});

	grunt.registerTask('remove-api', function () {
		const GruntLambdaRemove = require('./lib/grunt-lambda-remove');
		let done = this.async();
		task = new GruntLambdaRemove(grunt, done, __dirname);
	});

};
