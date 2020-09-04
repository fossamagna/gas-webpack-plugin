const webpack = require("webpack");
const MemoryFS = require("memory-fs");
const test = require('tap').test;
const GasPlugin = require('../');
const es3ifyPlugin = require('es3ify-webpack-plugin');

const options = {
  mode: 'none',
  devtool: 'source-map',
  context: __dirname + '/fixtures-fix-411',
  entry: "./main.ts",
  module: {
    rules: [
      {
        test: /(\.ts)$/,
        loader: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: [".ts"],
  },
  output: {
    path: __dirname + "/output",
    filename: "bundle.js",
  },
  plugins: [
    new GasPlugin(),
    new es3ifyPlugin()
  ],
  optimization: {
    minimize: false
  }
};

test('gas-plugin with es3ify', function(t) {
  const compiler = webpack(options);
  const mfs = new MemoryFS();
  compiler.outputFileSystem = mfs;
  compiler.run(function(err, stats) {
    t.error(err, 'build failed');
    const jsonStats = stats.toJson();
    t.ok(jsonStats.errors.length === 0);
    t.ok(jsonStats.warnings.length === 0);
    const bundle = mfs.readFileSync(__dirname + '/output/bundle.js', 'utf8');
    const output = `/**
 * Return write arguments.
 */
function echo() {
}
function plus() {
}
function minus() {
}`
    t.ok(bundle.toString().startsWith(output), 'plugin and expected output match');
    t.end();
  });
});

test('gas-plugin with es3ify prepend top-level functions when minimize is enabled', function(t) {
  options.optimization.minimize = true;
  const compiler = webpack(options);
  const mfs = new MemoryFS();
  compiler.outputFileSystem = mfs;
  compiler.run(function(err, stats) {
    t.error(err, 'build failed');
    const jsonStats = stats.toJson();
    t.ok(jsonStats.errors.length === 0);
    t.ok(jsonStats.warnings.length === 0);
    const bundle = mfs.readFileSync(__dirname + '/output/bundle.js', 'utf8');
    const output = 'function echo(){}function plus(){}function minus(){}'
    t.ok(bundle.toString().startsWith(output), 'plugin and expected output match');
    t.end();
  });
});
