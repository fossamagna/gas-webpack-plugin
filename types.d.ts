import type { Compiler, WebpackPluginInstance } from "webpack";

interface Options {
  /**
   * If true then generate a top level function declaration statement with comment.
   */
  comment?: boolean;
  /**
   * Array of source file paths that to generate global assignments expression from exports.* statements.
   */
  autoGlobalExportsFiles?: string[];
  /**
   * Array of path patterns to detect functions to generate top level function definitions. accept glob pattern.
   */
  include?: []
}

export default class implements WebpackPluginInstance {
  constructor(options?: Options);
  apply(compiler: Compiler): void;
}
