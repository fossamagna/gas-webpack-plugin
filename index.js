'use strict';

const { generate } = require('gas-entry-generator');
const { SourceMapSource, RawSource } = require('webpack-sources');
const { RuntimeGlobals, Dependency } = require('webpack');
const minimatch = require('minimatch');
const path = require('path');
const slash = require("slash");

const defaultOptions = {
  comment: true,
  autoGlobalExportsFiles: [],
  include: ["**/*"]
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

  const gasify = entries + source;
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
    this.autoGlobalExportsFilePatterns = options.autoGlobalExportsFilePatterns;
    this.includePatterns = options.includePatterns;
    this.entryFunctions = new Map();
  }

  match(target, pattern) {
    return minimatch(slash(target), slash(pattern));
  }

  apply(dep, source) {
    const module = dep.m;
    if (!this.includePatterns.some(file => this.match(module.resource, file))) {
      return;
    }
    const options = {
      comment: this.comment,
      autoGlobalExports: module.resource && this.autoGlobalExportsFilePatterns.some(file => this.match(module.resource, file)),
      exportsIdentifierName: RuntimeGlobals.exports,
      globalIdentifierName: RuntimeGlobals.global,
    };

    const originalSource = typeof source.original === 'function' 
      ? source.original().source()
      : source.source();

    const output = generate(originalSource, options);
    this.entryFunctions.set(module, output);
    if (output.globalAssignments) {
      source.insert(originalSource.length, output.globalAssignments);
    }
  }
};

GasPlugin.prototype.apply = function(compiler) {
  const context = compiler.options.context;
  const autoGlobalExportsFilePatterns = this.options.autoGlobalExportsFiles
    .map(file => path.isAbsolute(file) ? file : path.resolve(context, file));
  const includePatterns = this.options.include
    .map(file => path.isAbsolute(file) ? file : path.resolve(context, file));

  const plugin = { name: 'GasPlugin' };
  const compilationHook = (compilation, { normalModuleFactory }) => {
    const gasDependencyTemplate = new GasDependency.Template({
      comment: this.options.comment,
      autoGlobalExportsFilePatterns,
      includePatterns,
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

    compilation.hooks.additionalModuleRuntimeRequirements.tap(
      plugin,
      (_module, set) => {
        set.add(RuntimeGlobals.global);
      }
    );
  };

  compiler.hooks.compilation.tap(plugin, compilationHook);
};

module.exports = GasPlugin;
