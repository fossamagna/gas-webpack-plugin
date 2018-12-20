'use strict';

const gasEntryGenerator = require('gas-entry-generator');

function GasPlugin(options) {
  this.options = options || {comment: true};
}

GasPlugin.prototype.apply = function(compiler) {
  const options = this.options;
  const emit = function(compilation, callback) {
    compilation.chunks.forEach(function(chunk) {
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
    });
    callback();
  }

  if (compiler.hooks) {
    const plugin = { name: 'GasPlugin' }
    compiler.hooks.emit.tapAsync(plugin, emit);
  } else {
    compiler.plugin("emit", emit);
  }
};

module.exports = GasPlugin;
