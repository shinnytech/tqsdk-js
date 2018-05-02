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
var minimist = require('minimist');

var minifyJs = composer(minifyJsEs6, console);
var vString = '-v' + require('./package').version;

var dist_ta = 'dist_ta/';
var dist_tq = 'dist_tq/';

// 获取命令行参数
var argv = minimist(process.argv.slice(2));

gulp.task('default', ['clean'], function () {
    return gulp.start("indictor", 'trader');
});

/**
 * 清空目标文件夹
 */
gulp.task('clean', function () {
    return gulp.src([dist_ta, dist_tq]).pipe(clean());
});

/**
 * ta/translate.html
 * ta/translate.js
 */
gulp.task('translate.html', function () {
    return gulp.src(['./src/ta/translate.html'], { base: 'src' })
    .pipe(minifyHtml({ collapseWhitespace: true, removeComments: true }))
        .pipe(gulp.dest(dist_ta));
});

gulp.task('translate.js', function () {
    return gulp.src(['./src/ta/translate.js'], { base: 'src' })
        .pipe(minifyJs())
        .pipe(gulp.dest(dist_ta));
});



/**
 * ta/index.html
 */
gulp.task('indictor', ['css'], function () {
    delKeywordWarpContent('./src/ta/index.html', dist_ta + 'ta/index.html', 'del')
    return gulp.src([dist_ta + 'ta/index.html'])
        .pipe(minifyHtml({ collapseWhitespace: true, removeComments: true }))
        .pipe(replace('index.js', 'index' + vString + '.js'))
        .pipe(replace('index.css', 'index' + vString + '.css'))
        .pipe(gulp.dest(dist_ta + 'ta/'));
});

/**
 * copy css
 */
gulp.task('css', ['js'], function () {
    return gulp.src(['./src/ta/css/*.css'], { base: 'src' })
        .pipe(concat('index' + vString + '.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest(dist_ta + 'ta/css/'));
});

gulp.task('js', ['workerjs'], function () {
    return gulp.src(['./src/ta/js/*.js', './src/ta/index.js'], { base: 'src' })
        .pipe(concat('index' + vString + '.js'))
        .pipe(minifyJs())
        .pipe(replace('js/worker.js', 'worker' + vString + '.js'))
        .pipe(gulp.dest(dist_ta + 'ta/'));
});

gulp.task('workerjs', ['copy_ta', 'translate.html', 'translate.js'], function () {
    return gulp.src(['./src/ta/js/worker.js'])
        .pipe(concat('worker' + vString + '.js'))
        .pipe(minifyJs({}))
        .pipe(gulp.dest(dist_ta + 'ta/'));
});

gulp.task('copy_ta', ['beforecopy'], function () {
    return gulp.src([
        './src/assets/jquery.min.js',
        './src/assets/noty.js',
        './src/assets/bootstrap/js/bootstrap.min.js',
        './src/assets/bootstrap/css/bootstrap.min.css',
        './src/assets/bootstrap/fonts/**',
        './src/ta/ace-min/ace.js',
        './src/ta/ace-min/*-javascript.js',
        './src/ta/ace-min/ext-*.js',
        './src/ta/ace-min/keybinding-*.js',
        './src/ta/ace-min/theme-*.js',
        './src/ta/ace-min/snippets/javascript.js',
        './src/ta/ace-min/snippets/text.js',
        './src/ta/defaults/*',
        './src/libs/**',
        '!./src/libs/test/',
        '!./src/libs/test/*',
    ], { base: "src" })
    .pipe(gulp.dest(dist_ta));;
});

/**
 * 生成 defaults.json
 */
gulp.task('beforecopy', function () {
    var files = fs.readdirSync('./src/libs/ind/');
    var obj = {};
    files.forEach(function (filename) {
        if (filename.endsWith('.js') && filename != 'basefuncs.js') {
            var name = filename.substr(0, filename.length - 3);
            var content = fs.readFileSync('./src/libs/ind/' + filename, 'utf8');
            obj[name] = content.trim();
        }
    });
    fs.writeFileSync('./src/libs/ind/defaults.json', JSON.stringify(obj), 'utf8');
    return;
});


/**
 * trader.html + css + js
 */
gulp.task('trader', ['traderjs', 'copy_tq'], function () {
    var files = fs.readdirSync('./src/');
    var obj = {};
    files.forEach(function (filename) {
        if (filename.endsWith('.html') && filename != 'example.ma.html')
            delKeywordWarpContent('./src/' + filename, dist_tq + filename, 'concat');
    });
    return gulp.src(['./src/*.css'], { base: 'src' })
        .pipe(minifyCss())
        .pipe(gulp.dest(dist_tq));
});

gulp.task('traderjs', function () {
    var filelist = [];
    var reg = /src=\"(\S*)\"\>/;
    var fileContent = fs.readFileSync('./src/example.html', 'utf8');
    var start = false;
    var lines = fileContent.split(/\r?\n/);
    lines.forEach((ele, index, arr) => {
        if (ele.includes('concat:start')) {
            start = true;
        } else if (ele.includes('concat:end')) {
            start = false;
        } else if (start) {
            var matchRes = ele.match(reg);
            if (matchRes) filelist.push('./src/' + matchRes[1]);
        }
    });
    return gulp.src(filelist.concat('./src/tqsdk.js'))
        .pipe(concat('tqsdk.js'))
        .pipe(minifyJs({}))
        .pipe(gulp.dest(dist_tq));
});

gulp.task('copy_tq', function () {
    return gulp.src([
        './src/assets/jquery.min.js',
        './src/assets/noty.js',
        './src/assets/bootstrap/js/bootstrap.min.js',
        './src/assets/bootstrap/css/bootstrap.min.css',
        './src/assets/bootstrap/fonts/**',
        './src/assets/highlight/**',
        './src/libs/**',
        '!./src/libs/test/',
        '!./src/libs/test/*',
    ], { base: "src" })
        .pipe(gulp.dest(dist_tq));
});
/** trader.html + css + js */

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

/******* delete something in html ******/
function delKeywordWarpContent(sourcepath, targetpath, keyword) {
    var fileContent = fs.readFileSync(sourcepath, 'utf8');
    var start = false;
    var lines = fileContent.split(/\r?\n/);
    lines.forEach((ele, index, arr) => {
        if (ele.includes(keyword + ':start')) {
            start = true;
            arr[index] = '';
        } else if (ele.includes(keyword + ':end')) {
            start = false;
            arr[index] = '';
        } else if (start) {
            arr[index] = '';
        }
    });
    fs.writeFileSync(targetpath, lines.join('\n'), 'utf8');
    return;
}

/****** start: 如果在本地使用互联网的资源文件，要修改字体文件路径上的域名，因为默认使用的是相对路径 *******/
// var domain = '127.0.0.1';
// if (argv.d) {
//     domain = argv.d;
//     console.log('打包域名为', domain);
// } else {
//     console.log('默认打包域名为', domain);
//     console.log('使用 -d 可以修改默认打包域名')
// }
gulp.task('fontfilespath', ['workerjs'], function () {
    return gulp.src('./src/assets/bootstrap/css/bootstrap.min.css')
        .pipe(replace('../fonts/', 'http://' + domain + '/assets/bootstrap/fonts/'))
        .pipe(gulp.dest('./' + dist_ta + '/assets/bootstrap/css/bootstrap.min.css'));
});
/****** end: 如果在本地使用互联网的资源文件，要修改字体文件路径上的域名，因为默认使用的是相对路径 *******/
