import {ModelKeys} from './constants';
import {construct} from "../utils";
import {getModelRegistry} from "./Registry";

const getModelKey = (str: string) => ModelKeys.REFLECT + str;

/**
 * Defines a class as a Model class for serialization purposes
 *
 * @prop {{}} [props] additional properties to store as metadata
 * @decorator
 * @namespace Decorators
 * @memberOf Model
 */
export const model = (props?: {}) => (original: Function) => {

  // the new constructor behaviour
  const newConstructor : any = function (...args: any[]) {
    const instance = construct(original, ...args);

    const metadata = Object.assign({}, {
          class: original.name
        }, props || {});

    Object.defineProperty(instance, ModelKeys.ANCHOR, {
      writable: false,
      enumerable: true,
      configurable: false,
      value: metadata
    });

    Reflect.defineMetadata(
      getModelKey(ModelKeys.MODEL),
      metadata,
      instance.constructor
    );

    getModelRegistry().register(original.name, newConstructor);

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
