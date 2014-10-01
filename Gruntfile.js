module.exports = function (grunt) {
    grunt.initConfig({
        html2js: {
            app: {
                src: [
                    'client/partials/**/*.tpl.html'
                ],
                dest: 'client/build/templates.js'
            },
            options: {
                module: 'templates'
            }
        },
        less: {
            styles: {
                files: {
                    'client/build/base.css': 'client/style/base.less'
                }
            }
        },
        concat: {
            js: {
                src: [
                    'bower_components/angular/angular.js',
                    'bower_components/angular-ui-router/release/angular-ui-router.js',
                    'client/build/templates.js',
                    'client/lib/**/*.js'
                ],
                dest: 'client/build/app.js'
            },
            css: {
                src: [
                    'bower_components/reset-css/reset.css',
                    'client/build/base.css'
                ],
                dest: 'client/build/style.css'
            }
        },
        clean: [
            'client/build/templates.js',
            'client/build/base.css'
        ],
        watch: {
            source: {
                files: [
                    'client/lib/**/*.js',
                    'client/partials/**/*.tpl.html',
                    'client/style/**/*.less',
                    'client/index.html',
                    'main.js',
                    'Gruntfile.js'
                ],
                tasks: [
                    'default',
                    'watch'
                ],
                options: {
                    debounceDelay: 500
                }
            }
        }
    });

    [
        'grunt-html2js',
        'grunt-contrib-concat',
        'grunt-contrib-less',
        'grunt-contrib-clean',
        'grunt-contrib-watch'
    ].forEach(function (task) {
        grunt.loadNpmTasks(task);
    });

    grunt.registerTask('default', ['html2js', 'concat', 'less', 'clean']);
};
