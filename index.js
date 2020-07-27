'use strict';

const gasEntryGenerator = require('gas-entry-generator');

function GasPlugin(options) {
  this.options = options || {comment: true};
}

function gasify(compilation, options, chunk) {
  chunk.files.forEach(function(filename) {
    const source = compilation.assets[filename].source();
    const entries = gasEntryGenerator(source, options);
    const gasify = entries + source;
    compilation.assets[filename] = {
      source: function() {
        return gasify;
      },
      size: function() {
        return gasify.length;
      }
    }
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
