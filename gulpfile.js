'use strict';
var fs = require('fs');
var gulp = require('gulp');
var minifyHtml = require('gulp-htmlmin');
var minifyCss = require("gulp-minify-css");
// var minifyJs = require('gulp-uglify');
var composer = require('gulp-uglify/composer');
var minifyJsEs6 = require('uglify-es');
var clean = require('gulp-clean');
var rename = require("gulp-rename");
var concat = require('gulp-concat');
var connect = require('gulp-connect');
var replace = require('gulp-replace');
var gutil = require('gulp-util');

var minifyJs = composer(minifyJsEs6, console);

var vString = '-v' + require('./package').version;

var distDir = 'dist/';

gulp.task('js', ['workerjs'], function () {
    return gulp.src(['./src/js/*.js', './src/index.js'], {base: 'src'})
        .pipe(concat('index' + vString + '.js'))
        .pipe(minifyJs())
        .pipe(replace('worker.js', 'worker' + vString + '.js'))
        .pipe(gulp.dest(distDir));
});

gulp.task('workerjs', ['copy'], function () {
    var reg = /importScripts\((.+?)\);/;
    return gulp.src(['./src/js/worker/worker.js', './src/js/worker/*.js'])
        .pipe(concat('worker' + vString + '.js'))
        .pipe(replace(reg, 'importScripts("/defaults/basefuncs.js");'))
        .pipe(minifyJs({}))
        .pipe(gulp.dest('dist/js/worker/'));
});

gulp.task('copy', ['beforecopy'], function () {
    return gulp.src([
        './src/assets/jquery.min.js',
        './src/assets/noty.js',
        './src/assets/bootstrap/**',
        './src/assets/ace-min/ace.js',
        './src/assets/ace-min/*-javascript.js',
        './src/assets/ace-min/ext-*.js',
        './src/assets/ace-min/keybinding-*.js',
        './src/assets/ace-min/theme-*.js',
        './src/assets/ace-min/snippets/javascript.js',
        './src/assets/ace-min/snippets/text.js',
        './src/defaults/*',
    ], {base: "src"})
        .pipe(gulp.dest(distDir));
});

gulp.task('beforecopy', function () {
    // 生成 defaults.json
    var files = fs.readdirSync('./src/defaults/');
    var list = [];
    var obj = {};
    files.forEach(function (filename) {
        if (filename.endsWith('.js') && filename != 'basefuncs.js') {
            // list.push(filename.substr(0, filename.length - 3))
            var name = filename.substr(0, filename.length - 3);
            var content = fs.readFileSync('./src/defaults/' + filename, 'utf8');
            obj[name] = content.trim();
        }
    });
    fs.writeFileSync('./src/defaults/defaults.json', JSON.stringify(obj), 'utf8');
    return;
});


gulp.task('css', ['js'], function () {
    return gulp.src(['./src/css/*.css'], {base: 'src'})
        .pipe(concat('index' + vString + '.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest('dist/css/'));
});

gulp.task('html', ['css'], function () {
    var fileContent = fs.readFileSync('./src/index.html', 'utf8');
    var start = false;
    var lines = fileContent.split(/\r?\n/);
    lines.forEach((ele, index, arr) => {
        if (ele.includes('del:start')) {
            start = true;
            arr[index] = '';
        } else if (ele.includes('del:end')) {
            start = false;
            arr[index] = '';
        } else if (start) {
            arr[index] = '';
        }
    });
    fs.writeFileSync(distDir + 'index.html', lines.join('\n'), 'utf8');

    return gulp.src([distDir + '/index.html'])
        .pipe(minifyHtml({collapseWhitespace: true, removeComments: true}))
        .pipe(replace('index.js', 'index' + vString + '.js'))
        .pipe(replace('index.css', 'index' + vString + '.css'))
        .pipe(gulp.dest(distDir));
});

gulp.task('clean', function () {
    return gulp.src([distDir]).pipe(clean());
});

gulp.task('default', ['clean'], function () {
    return gulp.start("html");
});

gulp.task('localRun', function () {
    connect.server({
        root: 'src',
        port: 9999,
        livereload: true,
        middleware: function (connect, opt) {
            console.log(connect)
            console.log(opt)
            return []
        }
    })
});
