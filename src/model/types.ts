import { ModelErrorDefinition } from "./ModelErrorDefinition";
import { Model } from "./Model";

/**
 * @summary Typo of a Model builder function
 * @memberOf module:decorator-validation
 */
export type ModelBuilderFunction = <T extends Model>(
  self: T,
  obj?: T | Record<string, any>
) => T;

/**
 * @summary Definition of a Model Constructor Argument
 *
 * @memberOf module:decorator-validation
 *
 * @see ModelConstructor
 */
export type ModelArg<T> = T | Partial<T> | Record<string, any>;

/**
 * @summary Definition of a Class Constructor
 * @description Generic type for Constructor functions
 *
 * @typedef Constructor
 *
 * @param {any[]} [args]
 * @memberOf module:decorator-validation
 */
export type Constructor<T> = {
  new (...args: any[]): T;
};

/**
 * @summary Definition of a Model Constructor
 * @description Generic type for all Model Constructor functions
 *
 * @typedef ModelConstructor
 *
 * @param {ModelArg<T>} [model]
 * @param {any[]} [args]
 * @memberOf module:decorator-validation
 */
export type ModelConstructor<T extends Model> = {
  new (model?: ModelArg<T>, ...args: any[]): T;
};

/**
 * @summary Defines the Validation API for validatable models
 * @interface Validatable
 *
 * @category Validation
 */
export interface Validatable {
  /**
   * @summary Validates the model and returns the {@link ModelErrorDefinition} if any
   * @param {any} [args]
   *
   * @method
   */
  hasErrors(...args: any[]): ModelErrorDefinition | undefined;
}

/**
 * @summary Serializable interface
 *
 * @interface Serializable
 *
 * @category Serialization
 */
export interface Serializable {
  /**
   * @summary serializes the model
   * @method
   */
  serialize(): string;
}

/**
 * @summary Interface for objects that can be hashed
 * @interface Hashable
 */
export interface Hashable {
  /**
   * @summary Generates a hash string representation of the object
   * @method
   * @returns {string} Hash value representing the object
   */
  hash(): string;
}

/**
 * @summary Interface for objects that can be compared for equality
 * @interface Comparable
 * @template T The type of object to compare against
 */

export interface Comparable<T> {
  /**
   * @summary Compares this object with another for equality
   * @method
   * @param {T} other - The object to compare with
   * @param {...any[]} args - Additional arguments for comparison
   * @returns {boolean} True if the objects are equal, false otherwise
   */
  equals(other: T, ...args: any[]): boolean;
}
