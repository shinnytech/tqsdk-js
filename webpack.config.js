let path = require('path');
let webpack = require('webpack');
let exec = require('child_process').exec;

let version = require('./package.json').version;
let UglifyJsPlugin = require('uglifyjs-webpack-plugin');

let env = process.env;


let plugins = [];

if (env.NODE_ENV === 'development' && env.npm_lifecycle_event === 'dev_watch') {
  plugins.push({
    apply: (compiler) => {
      compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
        exec('cp -f lib/*.js /Users/yanqiong/Documents/shinny/shinny-futures-h5/lib/ && cp -f lib/*.js /Users/yanqiong/Documents/shinny/shinny-futures-web-alpha/node_modules/tqsdk/lib/',
          (err, stdout, stderr) => {
            if (stdout) process.stdout.write(stdout);
            if (stderr) process.stderr.write(stderr);
          });
      });
    }
  })
}

module.exports = {
  entry: {
    main: './src/index.js'
  },
  // mode: 'production', // development | production | none
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'tqsdk-' + version +'.js',
    library: 'TQSDK',
    libraryTarget: 'umd',
    libraryExport: 'default',
    auxiliaryComment: 'Test Comment'
  },
  module: {
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

  plugins,

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
};
