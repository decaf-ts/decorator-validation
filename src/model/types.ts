import type { ConditionalAsync } from "../types";
import { ModelErrorDefinition } from "./ModelErrorDefinition";
import { Model } from "./Model";

/**
 * @description Function type for building model instances from objects
 * @summary Type definition for a model builder function that populates model properties
 * @template T
 * @param {T} self - The target model instance to populate
 * @param {T | Record<string, any>} [obj] - The source object containing properties to copy
 * @return {T} - The populated model instance
 * @typedef ModelBuilderFunction
 * @memberOf module:decorator-validation
 */
export type ModelBuilderFunction = <T extends Model>(
  self: T,
  obj?: T | Record<string, any>
) => T;

/**
 * @description Type representing valid argument types for model constructors
 * @summary Definition of a Model Constructor Argument that can be a complete model, partial model, or plain object
 * @template T
 * @typedef ModelArg
 * @memberOf module:decorator-validation
 * @see ModelConstructor
 */
export type ModelArg<T> = T | Partial<T> | Record<string, any>;

/**
 * @description Specialized constructor type for Model classes
 * @summary Definition of a Model Constructor that creates instances of Model subclasses
 * @template T
 * @param {ModelArg<T>} [model] - Initial data to populate the model with
 * @param {any[]} [args] - Additional constructor arguments
 * @return {T} - An instance of the model class
 * @typedef ModelConstructor
 * @memberOf module:decorator-validation
 */
export type ModelConstructor<T extends Model> = {
  new (model?: ModelArg<T>, ...args: any[]): T;
};

/**
 * @description Interface for objects that can be validated.
 * @summary Defines the Validation API for validation behavior on models, supporting both synchronous and asynchronous validations.
 * Implementers must provide a `hasErrors` method that performs the validation and returns either validation errors or undefined if validation passes.
 *
 * @template Async - A boolean flag indicating whether the validation is asynchronous (`true`) or synchronous (`false`).
 *
 * @param {any[]} [args] - Optional arguments to control validation behavior passed to the validation method.
 *
 * @interface Validatable
 * @category Model
 * @memberOf module:decorator-validation
 *
 * @example
 * ```typescript
 * // Synchronous validation example
 * class SyncModel implements Validatable<false> {
 *   hasErrors(...args: any[]): ModelErrorDefinition | undefined {
 *     // perform synchronous validation logic
 *     return undefined; // or return errors if invalid
 *   }
 * }
 *
 * // Asynchronous validation example
 * class AsyncModel implements Validatable<true> {
 *   async hasErrors(...args: any[]): Promise<ModelErrorDefinition | undefined> {
 *     // perform asynchronous validation logic
 *     return undefined; // or return errors if invalid
 *   }
 * }
 * ```
 */
export interface Validatable<Async extends boolean = false> {
  /**
   * @description Validates the object against its validation rules.
   * @summary Validates the model and returns the {@link ModelErrorDefinition} if any errors exist, or `undefined` if no errors.
   *
   * @param {any[]} [args] - Optional arguments that may influence validation logic.
   * @return {ConditionalAsync<Async, ModelErrorDefinition | undefined>} Validation errors or undefined, conditionally wrapped in a Promise if asynchronous.
   *
   * @method
   */
  hasErrors(
    ...args: any[]
  ): ConditionalAsync<Async, ModelErrorDefinition | undefined>;
}

/**
 * @description Interface for objects that can be serialized to string
 * @summary Defines the serialization API for model objects
 * @interface Serializable
 * @memberOf module:decorator-validation
 * @category Model
 */
export interface Serializable {
  /**
   * @description Converts the object to a serialized string representation
   * @summary Serializes the model to a string format
   * @return {string} - The serialized string representation
   * @method
   */
  serialize(...args: any[]): string;
}

/**
 * @description Interface for objects that can generate a hash representation
 * @summary Defines the hashing API for model objects
 * @interface Hashable
 * @memberOf module:decorator-validation
 * @category Model
 */
export interface Hashable {
  /**
   * @description Generates a unique hash string for the object
   * @summary Creates a hash string representation of the object
   * @return {string} - Hash value representing the object
   * @method
   */
  hash(...args: any[]): string;
}

/**
 * @description Interface for objects that can be compared with other objects
 * @summary Defines the equality comparison API for model objects
 * @template T
 * @interface Comparable
 * @memberOf module:decorator-validation
 * @category Model
 */
export interface Comparable {
  /**
   * @description Determines if this object is equal to another object
   * @summary Compares this object with another for equality
   * @param {T} other - The object to compare with
   * @param {any[]} [args] - Additional arguments for comparison
   * @return {boolean} - True if the objects are equal, false otherwise
   * @method
   */
  equals<T extends Model>(this: T, other: T, ...args: any[]): boolean;

  compare<T extends Model>(
    this: T,
    other: T,
    ...args: any[]
  ): Comparison<T> | undefined;
}

export type SetterKeyFor<
  OBJ,
  K extends keyof OBJ,
> = `set${Capitalize<string & K>}`;

export type SetterFor<OBJ, K extends keyof OBJ, R> = (value: OBJ[K]) => R;

export type Builder<OUT, ARGS extends any[] = any[], IN = OUT> = {
  [K in keyof OUT as K extends keyof Model | "build" ? never : K]: OUT[K];
} & {
  [K in keyof OUT as K extends keyof Model | "build"
    ? never
    : SetterKeyFor<OUT, K>]: SetterFor<OUT, K, IN>;
} & {
  build: (...args: ARGS) => OUT | Promise<OUT>;
};

export type Comparison<M, K extends keyof M = keyof M> = Record<
  K,
  {
    other: M[K] | undefined;
    current: M[K] | undefined;
  }
>;
