# gas-webpack-plugin [![NPM version][npm-image]][npm-url] [![Build Status][github-actions-image]][github-actions-url] [![Coverage percentage][coveralls-image]][coveralls-url]

[Webpack](https://webpack.js.org/) plugin for Google Apps Script.

## About

In Google Apps Script, an entry point called from [google.script.run](https://developers.google.com/apps-script/guides/html/reference/run) must be a top level function declaration on the server side.
`gas-webpack-plugin` detects function assignment expressions to `global` object and generate a corresponding top level function declaration statement.

## example

main.js:
```js
var echo = require('./echo');
/**
 * Return write arguments.
 */
global.echo = echo;
```

echo.js:
```js
module.exports = function(message) {
  return message;
}
```

webpack.config.js:
```js
const GasPlugin = require("gas-webpack-plugin");
module.exports = {
  context: __dirname,
  entry: "./main.js",
  output: {
    path: __dirname ,
    filename: 'Code.gs'
  },
  plugins: [
    new GasPlugin()
  ]
}
```

build:
```
$ webpack --mode production
```

Code.gs
```js
/**
 * Return write arguments.
 */
function echo() {
}/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = function(message) {
  return message;
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var echo = __webpack_require__(1);
global.echo = echo;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ })
/******/ ]);
```

## Installation

```sh
$ npm install gas-webpack-plugin --save-dev
```

## Usage

### CLI

```sh
$ webpack --mode production
```

### Options

You can pass a hash of configuration options to gas-webpack-plugin. Allowed values are as follows

| Name | Type | Default | Description |
-------|------|---------|-------------|
| comment | `{Boolean}` | `true` | If true then generate a top level function declaration statement with comment. |
| autoGlobalExportsFiles | `{Array<String>}` | `[]` | Array of source file paths that to generate global assignments expression from exports.* statements. |
| include | `{Array<String>}` | `[**/*]` | Array of path patterns to detect functions to generate top level function definitions. accept glob pattern. |

## Geranate global assignment expressions from exports.*

Assignments expression to global object is automatically generated from named exports (`exports.*`) Included in the file specified by the autoGlobalExportsFiles option.

main.ts:
```ts
import './echo';
```

echo.ts:
```ts
// geranate global assignment expressions from named export
export const echo = (message) => message;
```

webpack.config.js:
```js
const GasPlugin = require("gas-webpack-plugin");
module.exports = {
  context: __dirname,
  entry: "./main.ts",
  module: {
    rules: [
      {
        test: /(\.ts)$/,
        loader: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: [".ts"],
  },
  output: {
    path: __dirname ,
    filename: 'Code.js'
  },
  plugins: [
    new GasPlugin({
      autoGlobalExportsFiles: ['**/*.ts']
    })
  ]
}
```

### Webpack version support

gas-webpack-plugin is support for Webpack@5.x

[npm-image]: https://badge.fury.io/js/gas-webpack-plugin.svg
[npm-url]: https://npmjs.org/package/gas-webpack-plugin
[github-actions-image]: https://github.com/fossamagna/gas-webpack-plugin/actions/workflows/test.yml/badge.svg?branch=master
[github-actions-url]: https://github.com/fossamagna/gas-webpack-plugin/actions/workflows/test.yml?branch=master
[coveralls-image]: https://coveralls.io/repos/github/fossamagna/gas-webpack-plugin/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/fossamagna/gas-webpack-plugin?branch=master
