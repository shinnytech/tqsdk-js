let path = require('path');
let webpack = require('webpack');
let exec = require('child_process').exec;

let version = require('./package.json').version;
let UglifyJsPlugin = require('uglifyjs-webpack-plugin');

let env = process.env.NODE_ENV || 'development';

let plugins = [];

if (env === 'development') {
  plugins.push({
    apply: (compiler) => {
      compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
        exec('cp lib/*.js /Users/yanqiong/Documents/shinny/shinny-futures-h5/lib/',
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
