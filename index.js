'use strict';

const { generate } = require('gas-entry-generator');
const { SourceMapSource, RawSource } = require('webpack-sources');
const Dependency = require('webpack/lib/Dependency');
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
      .filter(module => !!entryFunctions.get(module.id))
      .map(module => entryFunctions.get(module.id).entryPointFunctions)
      .filter(entries => !!entries)
      .join('\n');

    const needGlobalObject = chunk.getModules()
      .filter(module => !!entryFunctions.get(module.id))
      .some(module => !!entryFunctions.get(module.id).globalAssignments)

    const gasify = (needGlobalObject ? 'var global = this;\n' : '') + entries + source;
    compilation.assets[filename] = map
              ? new SourceMapSource(gasify, filename, map)
              : new RawSource(gasify);
  });
}

class GasDependency extends Dependency {
  constructor(module) {
    super();
    this. module = module;
  }
}

GasDependency.Template = class GasDependencyTemplate {
  constructor(options) {
    this.comment = options.comment;
    this.patterns = options.patterns;
    this.entryFunctions = new Map();
  }

  apply(dep, source) {
    const module = dep.module;
    const options = {
      comment: this.comment,
      autoGlobalExports: module.resource && this.patterns.some(file => minimatch(module.resource, file)),
    };
    const output = generate(source.source(), options);
    this.entryFunctions.set(module.id, output);
    if (output.globalAssignments) {
      source.insert(source.size(), output.globalAssignments);
    }
  }
};

GasPlugin.prototype.apply = function(compiler) {
  const context = compiler.options.context;
  const patterns = this.options.autoGlobalExportsFiles
    .map(file => path.isAbsolute(file) ? file : path.resolve(context, file));
  const plugin = { name: 'GasPlugin' };
  const compilationHook = (compilation) => {
    const gasDependencyTemplate = new GasDependency.Template({
      comment: this.options.comment,
      patterns
    });

    compilation.dependencyTemplates.set(
      GasDependency,
      gasDependencyTemplate
    );

    compilation.hooks.buildModule.tap('GasPlugin', module => {
      module.addDependency(new GasDependency(module));
    });

    compilation.hooks.optimizeChunkAssets.tapAsync(plugin, (chunks, callback) => {
      chunks.forEach(chunk => {
        gasify(compilation, chunk, gasDependencyTemplate.entryFunctions);
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
