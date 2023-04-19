import { echo } from './echo';
import { printHello } from './hello/world';
export { foo } from './hello/foo';

global.test = () => {
  printHello();
};
/**
 * Return write arguments.
 */
global.echo = echo;
