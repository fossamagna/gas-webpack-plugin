var echo = require('./echo');
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
