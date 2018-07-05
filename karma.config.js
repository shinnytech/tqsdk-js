// config.set({
//     browsers: ['Chrome', 'ChromeHeadless', 'MyHeadlessChrome'],
//
//     customLaunchers: {
//         MyHeadlessChrome: {
//             base: 'ChromeHeadless',
//             flags: ['--disable-translate', '--disable-extensions', '--remote-debugging-port=9223']
//         }
//     },
// }

// Karma configuration
// Generated on Thu Jul 05 2018 11:03:21 GMT+0800 (CST)

module.exports = function(config) {
    config.set({
        basePath: 'src',
        port: 9876,
        colors: true,

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha', 'chai'],

        // list of files / patterns to load in the browser
        files: [
            'test/test.js',
            'try.js',
            // 'ta/index.html',
            // 'libs/**/*.js'
            { pattern: 'assets/jquery.min.js', included: true, watched: false, served: true, nocache: false},
            { pattern: 'assets/*.js', included: true, watched: false, served: true, nocache: false},
            // { pattern: 'assets/*.js', included: true, watched: false, served: true, nocache: false},
            { pattern: 'assets/**/*.*', included: false, watched: false, served: true, nocache: false},

            { pattern: 'libs/func/*.js', included: true,},
            { pattern: 'ta/**/*.*', included: false, served: true, nocache: false},
            { pattern: 'libs/modules/utils.js', included: true},
            { pattern: 'libs/modules/*.js', included: true},
            { pattern: 'test/test_data.js', included: true},
            { pattern: 'libs/tqsdk.js', included: true},
        ],


        // list of files / patterns to exclude
        exclude: [
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors : {
            'libs/tqsdk.js': 'coverage',
            'libs/modules/*.js': 'coverage',
            'try.js': 'coverage',
        },

        // test results reporter to use possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],
        // 两个 coverageReporter 选择一个
        coverageReporter: {
            type : 'html',
            dir : '../coverage/',
        },
        /**
        coverageReporter: {
            dir : '../coverage/',
            reporters: [
                // reporters not supporting the `file` property
                { type: 'html', subdir: 'report-html' },
                { type: 'lcov', subdir: 'report-lcov' },
                // reporters supporting the `file` property, use `subdir` to directly
                // output them in the `dir` directory
                { type: 'cobertura', subdir: '.', file: 'cobertura.txt' },
                { type: 'lcovonly', subdir: '.', file: 'report-lcovonly.txt' },
                { type: 'teamcity', subdir: '.', file: 'teamcity.txt' },
                { type: 'text', subdir: '.', file: 'text.txt' },
                { type: 'text-summary', subdir: '.', file: 'text-summary.txt' },
            ]
        },
        */

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,
        autoWatchBatchDelay: 500,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        // browsers: ['Chrome', 'ChromeHeadless'],
        browsers: [ 'ChromeHeadless'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    })
}


