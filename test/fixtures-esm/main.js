import { echo } from './echo';
import { printHello } from './hello/world';

global.test = () => {
  printHello();
};
/**
 * Return write arguments.
 */
global.echo = echo;
