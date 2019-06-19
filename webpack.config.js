let path = require('path');
let webpack = require('webpack');
let exec = require('child_process').exec;

let version = require('./package.json').version;
let UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = function(env, argv){
  let plugins = [];
  if (argv.mode === 'development' && (process.env.npm_config_watch || argv.watch)) {
    plugins.push({
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
          // exec('cp -f lib/*.js /Users/yanqiong/Documents/shinny/shinny-futures-h5/lib/ && cp -f lib/*.js /Users/yanqiong/Documents/shinny/shinny-futures-web/node_modules/tqsdk/lib/',
          exec('cp -f lib/*.js /Users/yanqiong/Documents/Github/hello-vue/node_modules/tqsdk/lib/',
            (err, stdout, stderr) => {
              if (stdout) process.stdout.write(stdout);
              if (stderr) process.stderr.write(stderr);
            });
        });
      }
    })
  }
  return {
    entry: {
      main: ['@babel/polyfill', './src/index.js']
    },
    mode: argv.mode === 'development' ? 'development' : 'production', // development | production | none
    watch: argv.mode === 'development' && (process.env.npm_config_watch || argv.watch) ? true : false,
    watchOptions: {
      ignored: ['node_modules'],
      aggregateTimeout: 2000, // 当第一个文件更改，会在重新构建前增加延迟。这个选项允许 webpack 将这段时间内进行的任何其他更改都聚合到一次重新构建里。以毫秒为单位
    },
    output: {
      path: path.resolve(__dirname, 'lib'),
      filename: 'tqsdk.js',
      library: 'TQSDK',
      libraryTarget: 'umd',
      libraryExport: 'default',
      auxiliaryComment: 'Test Comment'
    },
    module: {
      // noParse: /node_modules\/localforage\/dist\/localforage.js/,
      rules: [
        {
          test: /\.js$/,
          exclude: '/node_modules/',
          loader: 'babel-loader',
          query: {
            presets: ["@babel/env"]
          }
        }
      ]
    },
    stats: {
      colors: true
    },

    plugins: plugins.concat([
      new webpack.DefinePlugin({
        __VERSION__: JSON.stringify(version),
      })
    ]),

    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          test: /\.js(\?.*)?$/i,
          uglifyOptions: {
            output: {
              beautify: false, // 最紧凑的输出
              comments: false // 删除所有的注释
            },
          }
        })
      ],
    }
  }
};
