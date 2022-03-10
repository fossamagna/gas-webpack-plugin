const webpack = require("webpack");
const MemoryFS = require("memory-fs");
const test = require('tap').test;
const GasPlugin = require('../');
const _ = require('lodash');

const options = {
  mode: 'production',
  context: __dirname + '/fixtures-include',
  entry: "./main.js",
  output: {
    path: __dirname + "/output",
    filename: "bundle.js",
  },
  plugins: [
    new GasPlugin({ include: ["./main.js"] })
  ]
};

test('gas-plugin include option', function(t) {
  const opts = _.cloneDeep(options);
  const compiler = webpack(opts);
  const mfs = new MemoryFS();
  compiler.outputFileSystem = mfs;
  compiler.run(function(err, stats) {
    t.error(err, 'build failed');
    const jsonStats = stats.toJson();
    t.ok(jsonStats.errors.length === 0, jsonStats.errors);
    t.ok(jsonStats.warnings.length === 0);
    const bundle = mfs.readFileSync(__dirname + '/output/bundle.js', 'utf8');
    const output = `function hi(){}`;
    console.log(bundle.toString())
    t.ok(bundle.toString().startsWith(output), 'plugin and expected output match');
    t.notMatch(bundle, /.*function echo.*/);
    t.end();
  });
});
