import ModelKeys from './constants';
import {construct} from "../utils";
import ModelRegistry from "./Registry";

const getModelKey = (str: string) => ModelKeys.REFLECT + str;

/**
 * Defines a class as a UI Model
 *
 * @decorator
 * @namespace Decorators
 * @memberOf Model
 */
export const model = () => (original: Function) => {

  // the new constructor behaviour
  const newConstructor : any = function (...args: any[]) {
    const instance = construct(original, ...args);

    Object.defineProperty(instance, ModelKeys.ANCHOR, {
      writable: false,
      enumerable: true,
      configurable: false,
      value: {
        class: original.name
      }
    })

    Reflect.defineMetadata(
      getModelKey(ModelKeys.MODEL),
      {
        class: original.name
      },
      instance.constructor
    );

    ModelRegistry.register(original.name, newConstructor);

    return instance;
  }

  // copy prototype so instanceof operator still works
  newConstructor.prototype = original.prototype;

  // return new constructor (will override original)
  return newConstructor;
}
