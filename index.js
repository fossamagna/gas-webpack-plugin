'use strict';

const { generate } = require('gas-entry-generator');
const { ConcatSource, SourceMapSource, RawSource } = require('webpack-sources');
const minimatch = require('minimatch');
const path = require('path');

const defaultOptions = {
  comment: true,
  autoGlobalExportsFiles: []
};

function GasPlugin(options) {
  this.options = Object.assign({}, defaultOptions, options || {});
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
      .map(module => entryFunctions.get(module.id).entryPointFunctions)
      .filter(entries => !!entries)
      .join('\n');

    const gasify = entries + source;
    compilation.assets[filename] = map
              ? new SourceMapSource(gasify, filename, map)
              : new RawSource(gasify);
  });
}

GasPlugin.prototype.apply = function(compiler) {
  const context = compiler.options.context;
  const patterns = this.options.autoGlobalExportsFiles
    .map(file => path.isAbsolute(file) ? file : path.resolve(context, file));
  const plugin = { name: 'GasPlugin' };
  const compilationHook = (compilation) => {
    const entryFunctions = new Map();
    const javascript = compilation.moduleTemplates.javascript;
    javascript.hooks.module.tap('GasPlugin', (source, module) => {
      const options = {
        comment: this.options.comment,
        autoGlobalExports: patterns.some(file => minimatch(module.resource, file)),
      };
      const output = generate(source.source(), options);
      entryFunctions.set(module.id, output);
      if (output.globalAssignments) {
        return new ConcatSource(source, output.globalAssignments);
      }
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
