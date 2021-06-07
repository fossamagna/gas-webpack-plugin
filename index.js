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

function gasify(compilation, chunk, filename, entryFunctions) {
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
  
  const entries = compilation.chunkGraph.getChunkModules(chunk)
    .filter(module => !!entryFunctions.get(module.rootModule || module))
    .map(module => entryFunctions.get(module.rootModule || module).entryPointFunctions)
    .filter(entries => !!entries)
    .join('\n');

  const needGloablObject = compilation.chunkGraph.getChunkModules(chunk)
  .filter(module => !!entryFunctions.get(module.rootModule || module))
  .some(module => !!entryFunctions.get(module.rootModule || module).globalAssignments);

  const gasify = (needGloablObject ? 'var global = this;\n' : '') + entries + source;
  compilation.assets[filename] = map
            ? new SourceMapSource(gasify, filename, map)
            : new RawSource(gasify);
}

class GasDependency extends Dependency {
  constructor(m) {
    super();
    this.m = m;
  }
}

GasDependency.Template = class GasDependencyTemplate {
  constructor(options) {
    this.comment = options.comment;
    this.patterns = options.patterns;
    this.entryFunctions = new Map();
  }

  apply(dep, source) {
    const module = dep.m;
    const options = {
      comment: this.comment,
      autoGlobalExports: module.resource && this.patterns.some(file => minimatch(module.resource, file)),
    };

    const originalSource = typeof source.original === 'function' 
      ? source.original().source()
      : source.source();

    const output = generate(originalSource, options);
    this.entryFunctions.set(module, output);
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
  const compilationHook = (compilation, { normalModuleFactory }) => {
    const gasDependencyTemplate = new GasDependency.Template({
      comment: this.options.comment,
      patterns
    });

    compilation.dependencyTemplates.set(
      GasDependency,
      gasDependencyTemplate
    );

    const handler = parser => {
      parser.hooks.program.tap(plugin, () => {
        parser.state.current.addDependency(new GasDependency(parser.state.current));
      });
    };

    normalModuleFactory.hooks.parser
      .for("javascript/auto")
      .tap("GasPlugin", handler);
    normalModuleFactory.hooks.parser
      .for("javascript/dynamic")
      .tap("GasPlugin", handler);
    normalModuleFactory.hooks.parser
      .for("javascript/esm")
      .tap("GasPlugin", handler);

    compilation.hooks.chunkAsset.tap(plugin, (chunk, filename) => {
      gasify(compilation, chunk, filename, gasDependencyTemplate.entryFunctions)
    });
  };

  compiler.hooks.compilation.tap(plugin, compilationHook);
};

module.exports = GasPlugin;
