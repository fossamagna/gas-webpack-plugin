var echo = require('./echo');
const seedrandom = require("seedrandom");

exports.foo = () => seedrandom("bar")();
/**
 * Return write arguments.
 */
global.echo = echo;

function plus(x, y) {
  return x + y;
}
function minus(x, y) {
  return x - y;
}
global.plus = plus, global.minus = minus;
