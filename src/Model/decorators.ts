import {ModelKeys} from './constants';
import {construct} from "../utils";
import {getModelRegistry} from "./Registry";

/**
 * @namespace model.decorators
 * @memberOf model
 */


/**
 *
 * @param {string} str
 * @return {string}
 *
 * @function getModelKey
 *
 * @memberOf model.decorators
 */
const getModelKey = (str: string) => ModelKeys.REFLECT + str;

/**
 * Defines a class as a Model class for serialization purposes
 *
 * @prop {{}} [props] additional properties to store as metadata
 * @prop {function(any): void} [instanceCallback] optional callback that will be call with the instance upon instantiation. defaults to undefined
 *
 * @decorator model
 *
 * @category Decorators
 */
export const model = (props?: {}, instanceCallback?: (instance: any) => void) => (original: Function) => {

  // the new constructor behaviour
  const newConstructor : any = function (...args: any[]) {
    const instance = construct(original, ...args);

    const metadata = Object.assign({}, {
          class: original.name
        });

    Object.defineProperty(instance, ModelKeys.ANCHOR, {
      writable: false,
      enumerable: true,
      configurable: false,
      value: metadata
    });

    Reflect.defineMetadata(
      getModelKey(ModelKeys.MODEL),
      Object.assign(metadata, props || {}),
      instance.constructor
    );

    getModelRegistry().register(original.name, newConstructor);

    if (instanceCallback)
      instanceCallback(instance);

    return instance;
  }

  // copy prototype so instanceof operator still works
  newConstructor.prototype = original.prototype;
  // Sets the proper constructor name for type verification
  Object.defineProperty(newConstructor, "name", {
    writable: false,
    enumerable: true,
    configurable: false,
    value: original.prototype.constructor.name
  });
  // return new constructor (will override original)
  return newConstructor;
}
