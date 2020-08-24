'use strict';

const gasEntryGenerator = require('gas-entry-generator');
const RawSource = require('webpack-sources').RawSource;
const SourceMapSource = require('webpack-sources').SourceMapSource;

function GasPlugin(options) {
  this.options = options || {comment: true};
}

function gasify(compilation, options, chunk) {
  chunk.files.forEach(function(filename) {
    const asset = compilation.assets[filename];
    let source, map;
    if (asset.sourceAndMap) {
      let sourceAndMap = asset.sourceAndMap();
      source = sourceAndMap.source;
      map = sourceAndMap.map
    } else {
      source = asset.source();
      map = typeof asset.map === 'function'
        ? asset.map()
        : null
    }
    const entries = gasEntryGenerator(source, options);
    const gasify = entries + source;
    compilation.assets[filename] = map
              ? new SourceMapSource(gasify, filename, map)
              : new RawSource(gasify);
  });
}

GasPlugin.prototype.apply = function(compiler) {
  const options = this.options;
  const plugin = { name: 'GasPlugin' };
  const compilationHook = (compilation) => {
    compilation.hooks.optimizeChunkAssets.tapAsync(plugin, (chunks, callback) => {
      chunks.forEach(chunk => {
        gasify(compilation, options, chunk);
      });
      callback();
    })
  };

  if (compiler.hooks) {
    compiler.hooks.compilation.tap(plugin, compilationHook);
  } else {
    compiler.plugin("compilation", compilationHook);
  }
};

module.exports = GasPlugin;
