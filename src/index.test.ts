import webpack from 'webpack';
import MemoryFS from 'memory-fs';
import GasPlugin from './index';
import { expect } from 'chai';
import 'mocha';

describe('gas-plugin', () => {
    let stats: webpack.Stats.ToJsonOutput;
    let bundle: any;

    before(async() => {
        const mfs = new MemoryFS();
        const compiler = webpack({
            mode: 'production',
            context: __dirname + '/fixtures',
            entry: "./main.js",
            output: {
                path: __dirname + "/output",
                filename: "bundle.gs"
            },
            plugins: [
                new GasPlugin(),
            ]
        });
        compiler.outputFileSystem = mfs;

        stats = await new Promise((resolve, resolveErr) => {
            compiler.run((e, s) => {
                if (e) resolveErr(e);
                resolve(s.toJson());
            });
        });

        bundle = await new Promise((resolve, resolveErr) => {
            mfs.readFile(__dirname + '/output/bundle.gs', 'utf8', (e, r) => {
                if (e) resolveErr(e);
                resolve(r);
            });
        })
    });

    it('outputs no errors or warnings', () => {
        expect(stats.errors.length).to.equal(0);
        expect(stats.warnings.length).to.equal(0);
    });

    const output = `/**
 * Return write arguments.
 */
function echo() {
}
function plus() {
}
function minus() {
}`;

    it('outputs correctly', () => {
        expect(bundle.toString()).to.satisfy((s: string) => s.startsWith(output));
    });
})
