import { bindModelPrototype, construct } from "./construction";
import { ModelKeys } from "../utils/constants";
import { Model } from "./Model";
import { apply, metadata } from "@decaf-ts/reflection";
import { Decoration } from "../utils/Decoration";

/**
 * @summary defines the tpe os an InstanceCallback function
 *
 * @memberOf module:decorator-validation.Model
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
 * @memberOf module:decorator-validation.Model
 *
 */
export function model(instanceCallback?: InstanceCallback) {
  const key = Model.key(ModelKeys.MODEL);
  function modelDec(original: any) {
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
  }
  // return Decoration.for(key).define(modelDec).apply();

  return modelDec;
}

export function hashedBy(algorithm: string, ...args: any[]) {
  return metadata(Model.key(ModelKeys.HASHING), {
    algorithm: algorithm,
    args: args,
  });
}

export function serializedBy(serializer: string, ...args: any[]) {
  return metadata(Model.key(ModelKeys.SERIALIZATION), {
    serializer: serializer,
    args: args,
  });
}
