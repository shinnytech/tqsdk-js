import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { eslint } from 'rollup-plugin-eslint'
import babel from 'rollup-plugin-babel' // 支持使用最新版本的 es 语法, 不包括语言新功能 polyfill，要使用 core-js
import { terser } from 'rollup-plugin-terser' // 代码混淆
const plugins = [
  json(),
  eslint({
    fix: true,
    include: ['src/*']
  }),
  resolve({ preferBuiltins: true }), // so Rollup can find `ms`
  commonjs(), // so Rollup can convert `ms` to an ES module
  babel()
]
export default [{
  input: 'main-cache.js',
  output: [{
    file: 'dist/umd/tqsdk.js',
    name: 'TQSDK',
    format: 'umd' // Universal Module Definition, works as amd, cjs and iife all in one
  }, {
    file: 'dist/umd/tqsdk.min.js',
    name: 'TQSDK',
    format: 'umd',
    plugins: [terser()]
  }],
  plugins
}, {
  input: 'main.js',
  output: [{
    file: 'dist/esm/tqsdk.js',
    name: 'TQSDK',
    format: 'esm' // Keep the bundle as an ES module file, suitable for other bundlers and inclusion as a <script type=module> tag in modern browsers
  }, {
    file: 'dist/esm/tqsdk.min.js',
    name: 'TQSDK',
    format: 'umd'
  }],
  plugins
}]
