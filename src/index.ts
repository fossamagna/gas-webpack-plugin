import gasEntryGenerator from 'gas-entry-generator';
import webpack from 'webpack';

type Compiler = webpack.Compiler;
type Compilation = webpack.compilation.Compilation;

export interface GasPluginOptions {
    comment: boolean;
}

export default class GasPlugin {
    options: GasPluginOptions;

    constructor(options?: GasPluginOptions) {
        this.options = options || { comment: true };
    }

    apply(compiler: Compiler) {
        const emit = (cpn: Compilation, callback: () => any) => {
            cpn.chunks.forEach((chunk: webpack.compilation.Chunk) => {
                chunk.files.forEach(filename => {
                    const source = cpn.assets[filename].source();
                    const entries = gasEntryGenerator(source, this.options);
                    const gasify = entries + source;
                    cpn.assets[filename] = {
                        source: () => gasify,
                        size: () => gasify.length,
                    }
                });
            });
            callback();
        }

        if (compiler.hooks) {
            compiler.hooks.emit.tapAsync('GasPlugin', emit);
        } else {
            compiler.plugin("emit", emit);
        }
    }
}
