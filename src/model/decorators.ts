import { bindModelPrototype, construct } from "./construction";
import { ModelKeys } from "../utils/constants";
import { Model } from "./Model";
import { getModelKey } from "./utils";
import { metadata } from "@decaf-ts/reflection";

/**
 * @summary defines the tpe os an InstanceCallback function
 * @memberOf module:decorator-validation.Construction
 * @category Construction
 */
export type InstanceCallback = (instance: any, ...args: any[]) => void;

/**
 * @summary Defines a class as a Model class
 * @description
 *
 * - Registers the class under the model registry so it can be easily rebuilt;
 * - Overrides the class constructor;
 * - Runs the global {@link ModelBuilderFunction} if defined;
 * - Runs the optional {@link InstanceCallback} if provided;
 * - Defines an {@link ModelKeys#ANCHOR} property for serialization and model rebuilding purposes;
 *
 * @param {string} [nameOverride]
 * @param {InstanceCallback} [instanceCallback] optional callback that will be called with the instance upon instantiation. defaults to undefined
 *
 * @param basePrototype
 * @function model
 * @category Decorators
 */
export function model(
  nameOverride?: string,
  instanceCallback?: InstanceCallback,
) {
  return (original: any) => {
    // the new constructor behaviour
    const newConstructor: any = function (...args: any[]) {
      const instance: ReturnType<typeof original> = construct(
        original,
        ...args,
      );
      bindModelPrototype(instance);
      // run a builder function if defined with the first argument (The ModelArg)
      const builder = Model.getBuilder();
      if (builder) builder(instance, args.length ? args[0] : undefined);

      metadata(
        getModelKey(ModelKeys.MODEL),
        nameOverride || original.name,
      )(instance.constructor);

      if (instanceCallback) instanceCallback(instance, ...args);

      return instance;
    };

    // copy prototype so instanceof operator still works
    newConstructor.prototype = original.prototype;
    // Sets the proper constructor name for type verification
    Object.defineProperty(newConstructor, "name", {
      writable: false,
      enumerable: true,
      configurable: false,
      value: original.prototype.constructor.name,
    });

    metadata(
      getModelKey(ModelKeys.MODEL),
      nameOverride || original.name,
    )(original);

    Model.register(newConstructor, nameOverride);

    // return new constructor (will override original)
    return newConstructor;
  };
}
