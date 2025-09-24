import { bindModelPrototype, construct } from "./construction";
import { ModelKeys } from "../utils/constants";
import { Model } from "./Model";
import { Decoration, metadata } from "@decaf-ts/decoration";

export function modelBaseDecorator(original: any) {
  // the new constructor behaviour
  const newConstructor: any = function (...args: any[]) {
    const instance: ReturnType<typeof original> = construct(original, ...args);
    bindModelPrototype(instance);

    // re-apply original constructor
    Object.defineProperty(instance, "constructor", {
      writable: false,
      enumerable: false,
      configurable: false,
      value: original,
    });

    // run a builder function if defined with the first argument (The ModelArg)
    const builder = Model.getBuilder();
    if (builder) builder(instance, args.length ? args[0] : undefined);

    metadata(ModelKeys.ORIGINAL_CLASS, original.name)(instance.constructor);

    return instance;
  };

  // copy prototype so instanceof operator still works
  newConstructor.prototype = original.prototype;

  metadata(ModelKeys.ORIGINAL_CLASS, original.name)(original);

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
  //
  // anchors the original constructor for future reference
  Object.defineProperty(newConstructor, ModelKeys.ANCHOR, {
    writable: false,
    enumerable: false,
    configurable: false,
    value: original,
  });
  //
  // // anchors the new constructor for future reference
  // Object.defineProperty(original, ModelKeys.ANCHOR, {
  //   writable: false,
  //   enumerable: true,
  //   configurable: false,
  //   value: newConstructor,
  // });

  Model.register(newConstructor, original.name);

  // return new constructor (will override original)
  return newConstructor;
}

/**
 * @summary Defines a class as a Model class
 * @description
 *
 * - Registers the class under the model registry so it can be easily rebuilt;
 * - Overrides the class constructor;
 * - Runs the global {@link ModelBuilderFunction} if defined;
 *
 * @function model
 *
 * @category Class Decorators
 */
export function model() {
  const key = ModelKeys.MODEL;
  return Decoration.for(key).define(modelBaseDecorator).apply();
}

/**
 * @summary Defines the hashing algorithm to use on the model
 * @description
 *
 * - Registers the class under the model registry so it can be easily rebuilt;
 * - Overrides the class constructor;
 * - Runs the global {@link ModelBuilderFunction} if defined;
 *
 * @param {string} algorithm the algorithm to use
 *
 * @function hashedBy
 *
 * @category Class Decorators
 */
export function hashedBy(algorithm: string, ...args: any[]) {
  return metadata(ModelKeys.HASHING, {
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
  return metadata(ModelKeys.SERIALIZATION, {
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
  return metadata(ModelKeys.DESCRIPTION, description);
}
