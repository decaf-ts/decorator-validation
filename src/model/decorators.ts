import {construct} from "./construction";
import {ModelKeys} from "../utils/constants";
import {Model} from "./Model";


/**
 * @summary Builds the key to store as Metadata under Reflections
 * @description concatenates {@link ModelKeys#REFLECT} with the provided key
 * @param {string} str
 *
 * @function getModelKey
 * @memberOf module:decorator-validation.Model
 * @category Utilities
 */
export const getModelKey = (str: string) => ModelKeys.REFLECT + str;
/**
 * @summary defines the tpe os an InstanceCallback function
 * @memberOf module:decorator-validation.Construction
 * @category Construction
 */
export type InstanceCallback = (instance: any, ...args: any[]) => void

/**
 * @summary Defines a class as a Model class
 * @description
 * - Registers the class under the model registry so it can be easily rebuilt;
 * - Overrides the class constructor;
 * - Runs the global {@link ModelBuilderFunction} if defined;
 * - Runs the optional {@link InstanceCallback} if provided;
 * - Defines an {@link ModelKeys#ANCHOR} property for serialization and model rebuilding purposes;
 *
 * @prop {Record<string, any>} [props] additional properties to store as metadata
 * @prop {InstanceCallback} [instanceCallback] optional callback that will be call with the instance upon instantiation. defaults to undefined
 *
 * @function model
 * @memberOf module:decorator-validation.Decorators.Model
 * @category Decorators
 */
export function model(props?: Record<string, any>, instanceCallback?: InstanceCallback) {
  return (original: Function) => {

    // the new constructor behaviour
    const newConstructor : any = function (...args: any[]) {
      const instance = construct(original, ...args);
      // run a builder function if defined with the first argument (The ModelArg)
      const builder = Model.getBuilder();
      if (builder)
        builder(instance, args.length ? args[0] : undefined);

      const metadata = Object.assign({}, {
        class: original.name
      });

      Object.defineProperty(instance, ModelKeys.ANCHOR, {
        writable: false,
        enumerable: false,
        configurable: false,
        value: metadata
      });

      Reflect.defineMetadata(
          getModelKey(ModelKeys.MODEL),
          Object.assign(metadata, props || {}),
          instance.constructor
      );

      if (instanceCallback)
        instanceCallback(instance, ...args);

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

    Model.register(newConstructor);

    // return new constructor (will override original)
    return newConstructor;
  }
}
