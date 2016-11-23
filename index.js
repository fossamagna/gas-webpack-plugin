'use strict';

var gasEntryGenerator = require('gas-entry-generator');

function GasPlugin() {
}

GasPlugin.prototype.apply = function(compiler) {
  compiler.plugin("emit", function(compilation, callback) {
    compilation.chunks.forEach(function(chunk) {
      chunk.files.forEach(function(filename) {
        var source = compilation.assets[filename].source();
        var entries = gasEntryGenerator(source);
        var gasify = entries + source;
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
  });
};

module.exports = GasPlugin;
