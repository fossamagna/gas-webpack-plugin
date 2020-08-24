import echo from './echo';
/**
 * Return write arguments.
 */
global.echo = echo;

function plus(x: number, y: number) {
  return x + y;
}
function minus(x: number, y: number) {
  return x - y;
}
global.plus = plus, global.minus = minus;
