import { bindModelPrototype, construct } from "./construction";
import { ModelKeys } from "../utils/constants";
import { Model } from "./Model";
import { metadata } from "@decaf-ts/reflection";
import { propMetadata } from "../utils";

/**
 * @summary defines the tpe os an InstanceCallback function
 *
 * @memberOf module:decorator-validation
 * @category Model
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
 *
 * @param {InstanceCallback} [instanceCallback] optional callback that will be called with the instance upon instantiation. defaults to undefined
 *
 * @function model
 *
 * @category Class Decorators
 */
export function model(instanceCallback?: InstanceCallback) {
  return ((original: any) => {
    // the new constructor behaviour
    const newConstructor: any = function (...args: any[]) {
      const instance: ReturnType<typeof original> = construct(
        original,
        ...args
      );
      bindModelPrototype(instance);
      // run a builder function if defined with the first argument (The ModelArg)
      const builder = Model.getBuilder();
      if (builder) builder(instance, args.length ? args[0] : undefined);

      metadata(Model.key(ModelKeys.MODEL), original.name)(instance.constructor);

      if (instanceCallback) instanceCallback(instance, ...args);

      return instance;
    };

    // copy prototype so instanceof operator still works
    newConstructor.prototype = original.prototype;

    Reflect.getMetadataKeys(original).forEach((key) => {
      Reflect.defineMetadata(
        key,
        Reflect.getMetadata(key, original),
        newConstructor
      );
    });
    // Sets the proper constructor name for type verification
    Object.defineProperty(newConstructor, "name", {
      writable: false,
      enumerable: true,
      configurable: false,
      value: original.prototype.constructor.name,
    });

    metadata(Model.key(ModelKeys.MODEL), original.name)(original);

    Model.register(newConstructor, original.name);

    // return new constructor (will override original)
    return newConstructor;
  }) as any;
}

/**
 * @summary Defines the hashing algorithm to use on the model
 * @description
 *
 * - Registers the class under the model registry so it can be easily rebuilt;
 * - Overrides the class constructor;
 * - Runs the global {@link ModelBuilderFunction} if defined;
 * - Runs the optional {@link InstanceCallback} if provided;
 *
 * @param {string} algorithm the algorithm to use
 *
 * @function hashedBy
 *
 * @category Class Decorators
 */
export function hashedBy(algorithm: string, ...args: any[]) {
  return metadata(Model.key(ModelKeys.HASHING), {
    algorithm: algorithm,
    args: args,
  });
}

/**
 * @summary Defines the serialization algorithm to use on the model
 *
 * @param {string} serializer the algorithm to use
 *
 * @function serializedBy
 *
 * @category Class Decorators
 */
export function serializedBy(serializer: string, ...args: any[]) {
  return metadata(Model.key(ModelKeys.SERIALIZATION), {
    serializer: serializer,
    args: args,
  });
}

/**
 * @summary Applies descriptive metadata to a class, property or method
 *
 * @param {string} description the description to apply
 *
 * @function description
 *
 * @category Decorators
 */
export function description(description: string) {
  return metadata(Model.key(ModelKeys.DESCRIPTION), description);
}
