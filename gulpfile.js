'use strict';
var fs = require('fs');
var path = require("path");
var gulp = require('gulp');
var minifyHtml = require('gulp-htmlmin');
var minifyCss = require("gulp-minify-css");
var composer = require('gulp-uglify/composer');
var minifyJsEs6 = require('uglify-es');
var clean = require('gulp-clean');
var rename = require("gulp-rename");
var concat = require('gulp-concat');
var connect = require('gulp-connect');
var replace = require('gulp-replace');
var gutil = require('gulp-util');
var minimist = require('minimist');

var Server = require('karma').Server;
gulp.task('test', function (done) {
    // Karma Run test once and exit
    new Server({
        configFile: __dirname + '/karma.config.js',
        singleRun: true
    }, done).start();
});

var minifyJs = composer(minifyJsEs6, console);
var vString = '-v' + require('./package').version;

var dist = 'dist/';

// 获取命令行参数
var argv = minimist(process.argv.slice(2));

gulp.task('default', ['clean', 'test'], function () {
    fs.mkdirSync(dist);
    fs.mkdirSync(dist + 'libs');
    fs.mkdirSync(dist + 'ta');
    fs.mkdirSync(dist + 'libs/custom');
    return gulp.start('copy', 'minicss', 'tqsdk', 'workerjs', 'minihtml', 'translator');
});

/**
 * 清空目标文件夹
 */
gulp.task('clean', function () {
    return gulp.src([dist]).pipe(clean());
});

/**
 * translator
 */
gulp.task('translator', ['translatorjs'], function(){
    return gulp.src(['./src/ta/translate.html'], { base: 'src' })
        .pipe(minifyHtml({ collapseWhitespace: true, removeComments: true }))
        .pipe(gulp.dest(dist));
});
gulp.task('translatorjs', function () {
    return gulp.src(['./src/ta/translate.js'], { base: 'src' })
        .pipe(minifyJs())
        .pipe(gulp.dest(dist));
});


/**
 * tqsdk
 */
gulp.task('tqsdk', function () {
    return gulp.src(['./src/libs/modules/*', './src/libs/tqsdk.js'], { base: 'src' })
        .pipe(concat('tqsdk.js'))
        .pipe(minifyJs())
        .pipe(gulp.dest(dist + 'libs/'));
});

gulp.task('workerjs', function () {
    delKeywordWarpContent('./src/ta/worker.js', dist + 'ta/worker.js', 'del');
    return gulp.src(['./dist/ta/worker.js'], { base: 'dist' })
        .pipe(minifyJs())
        .pipe(gulp.dest(dist));
});

gulp.task('minicss', function () {
    return gulp.src(['./src/ta/css/index.css', './src/tq.css'], { base: 'src' })
        .pipe(minifyCss())
        .pipe(gulp.dest(dist));
});

/**
 * ta/index.html
 */
gulp.task('minihtml', ['indictorjs'], function () {
    //trades
    fs.readdirSync('./src/').forEach((f)=>{
        if (f.endsWith('.html') && (f.startsWith('tq.') || f.startsWith('example.'))){
            delKeywordWarpContent('./src/' + f, dist + f, 'del')
        }
    });
    //indictor
    delKeywordWarpContent('./src/ta/index.html', dist + 'ta/index.html', 'del')
    return gulp.src([dist + 'ta/index.html'])
        .pipe(minifyHtml({ collapseWhitespace: true, removeComments: true }))
        .pipe(gulp.dest(dist + 'ta/'));
});

gulp.task('indictorjs', function () {
    return gulp.src([
        './src/libs/modules/color.js',
        './src/libs/modules/utils.js',
        './src/ta/js/tqtooltips.js',
        './src/ta/js/list_menu.js',
        './src/ta/index.js'
    ], { base: 'src' })
        .pipe(concat('index.js'))
        .pipe(minifyJs())
        .pipe(gulp.dest(dist + 'ta/'));
});

gulp.task('copy', [], function () {
    return gulp.src([
        './src/assets/jquery.min.js',
        './src/assets/noty.js',
        './src/assets/bootstrap/js/bootstrap.min.js',
        './src/assets/bootstrap/css/bootstrap.min.css',
        './src/assets/bootstrap/fonts/**',
        './src/assets/highlight/**', //tq
        './src/assets/ace-min/ace.js',
        './src/assets/ace-min/*-javascript.js',
        './src/assets/ace-min/ext-*.js',
        './src/assets/ace-min/keybinding-*.js',
        './src/assets/ace-min/theme-*.js',
        './src/assets/ace-min/snippets/javascript.js',
        './src/assets/ace-min/snippets/text.js',
        './src/libs/func/*',
        './src/libs/ind/*',
        './src/libs/custom/*',
        '!./src/libs/custom/sarTrade.js',
        './src/libs/task/*',
    ], { base: "src" })
    .pipe(gulp.dest(dist));;
});

/******* delete something in html ******/
function delKeywordWarpContent(sourcepath, targetpath, keyword) {
    var fileContent = fs.readFileSync(sourcepath, 'utf8');
    var start = false;
    var lines = fileContent.split(/\r?\n/);
    var start = -1, end = -1;
    lines.forEach((ele, index, arr) => {
        if (ele.includes(keyword + ':start')) {
            start = index;
        } else if (ele.includes(keyword + ':end')) {
            end = index;
        }
    });
    if(start >= 0 && end >= 0){
        lines.splice(start, end - start + 1);
    }
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
