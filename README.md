# gas-webpack-plugin [![NPM version][npm-image]][npm-url]  [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]  [![Coverage percentage][coveralls-image]][coveralls-url]

[Webpack](https://webpack.github.io/) plugin for Google Apps Script.

## About

In Google Apps Script, it must be top level function declaration that entry point called from [google.script.run](https://developers.google.com/apps-script/guides/html/reference/run).
When `gas-webpack-plugin` detect a function assignment expression to `global` object. it generate a top level function declaration statement.

## example

main.js:
```js
var echo = require('./echo');
global.echo = echo;
```

echo.js:
```
module.exports = function(message) {
  return message;
}
```

webpack.config.js:
```js
var GasPlugin = require("gas-webpack-plugin");
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
$ webpack
```

Code.gs
```js
function echo() {
}/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var echo = __webpack_require__(1);
	global.echo = echo;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = function (message) {
	  return message;
	};


/***/ }
/******/ ]);
```

## Installation

```sh
$ npm install gas-webpack-plugin --save-dev
```

## Usage

### CLI

```sh
$ webpack
```

[npm-image]: https://badge.fury.io/js/gas-webpack-plugin.svg
[npm-url]: https://npmjs.org/package/gas-webpack-plugin
[travis-image]: https://travis-ci.org/fossamagna/gas-webpack-plugin.svg?branch=master
[travis-url]: https://travis-ci.org/fossamagna/gas-webpack-plugin
[daviddm-image]: https://david-dm.org/fossamagna/gas-webpack-plugin.svg
[daviddm-url]: https://david-dm.org/fossamagna/gas-webpack-plugin
[coveralls-image]: https://coveralls.io/repos/github/fossamagna/gas-webpack-plugin/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/fossamagna/gas-webpack-plugin?branch=master
