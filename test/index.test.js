const webpack = require("webpack");
const MemoryFS = require("memory-fs");
const test = require('tap').test;
const GasPlugin = require('../');
const _ = require('lodash');

const options = {
  mode: 'production',
  context: __dirname + '/fixtures',
  entry: "./main.js",
  output: {
    path: __dirname + "/output",
    filename: "bundle.js",
  },
  plugins: [
    new GasPlugin()
  ],
  optimization: {
    minimize: false,
  }
};

test('gas-plugin', function(t) {
  const opts = _.cloneDeep(options);
  const compiler = webpack(opts);
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

test('gas-plugin prepend top-level functions when minimize is enabled', function(t) {
  const opts = _.cloneDeep(options);
  opts.optimization.minimize = true;
  const compiler = webpack(opts);
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

test('gas-plugin prepend top-level functions in development mode', function(t) {
  const opts = _.cloneDeep(options);
  opts.mode = 'development';
  const compiler = webpack(opts);
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
