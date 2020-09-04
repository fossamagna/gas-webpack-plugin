'use strict';

const gasEntryGenerator = require('gas-entry-generator');
const RawSource = require('webpack-sources').RawSource;
const SourceMapSource = require('webpack-sources').SourceMapSource;

function GasPlugin(options) {
  this.options = options || {comment: true};
}

function gasify(compilation, chunk, entryFunctions) {
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

    const entries = chunk.getModules()
      .map(module => entryFunctions.get(module.id))
      .filter(entries => !!entries)
      .join('');

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
    const entryFunctions = new Map();
    const javascript = compilation.moduleTemplates.javascript;
    javascript.hooks.module.tap('GasPlugin', (source, module) => {
      const entries = gasEntryGenerator(source.source(), options);
      entryFunctions.set(module.id, entries);
    });

    compilation.hooks.optimizeChunkAssets.tapAsync(plugin, (chunks, callback) => {
      chunks.forEach(chunk => {
        gasify(compilation, chunk, entryFunctions);
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
