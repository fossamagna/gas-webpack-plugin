# gas-webpack-plugin [![NPM version][npm-image]][npm-url]  [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]  [![Coverage percentage][coveralls-image]][coveralls-url]
[![Greenkeeper badge](https://badges.greenkeeper.io/fossamagna/gas-webpack-plugin.svg)](https://greenkeeper.io/)

[Webpack](https://webpack.github.io/) plugin for Google Apps Script.

## About

In Google Apps Script, it must be top level function declaration that entry point called from [google.script.run](https://developers.google.com/apps-script/guides/html/reference/run).
When `gas-webpack-plugin` detect a function assignment expression to `global` object. it generate a top level function declaration statement.

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

### Webpack version support

gas-webpack-plugin is support for Webpack@1.x, Webpack@2.x, Webpack@3.x and Webpack@4.x

[npm-image]: https://badge.fury.io/js/gas-webpack-plugin.svg
[npm-url]: https://npmjs.org/package/gas-webpack-plugin
[travis-image]: https://travis-ci.org/fossamagna/gas-webpack-plugin.svg?branch=master
[travis-url]: https://travis-ci.org/fossamagna/gas-webpack-plugin
[daviddm-image]: https://david-dm.org/fossamagna/gas-webpack-plugin.svg
[daviddm-url]: https://david-dm.org/fossamagna/gas-webpack-plugin
[coveralls-image]: https://coveralls.io/repos/github/fossamagna/gas-webpack-plugin/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/fossamagna/gas-webpack-plugin?branch=master
