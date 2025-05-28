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
 * @description Generic type for class constructor functions
 * @summary Definition of a Class Constructor that can create instances of a specified type
 * @template T
 * @param {any[]} [args] - Constructor arguments
 * @return {T} - An instance of the class
 * @typedef Constructor
 * @memberOf module:decorator-validation
 */
export type Constructor<T> = {
  new (...args: any[]): T;
};

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
 * @description Interface for objects that can be validated
 * @summary Defines the Validation API for validatable models
 * @interface Validatable
 * @memberOf module:decorator-validation
 * @category Model
 */
export interface Validatable {
  /**
   * @description Validates the object against its validation rules
   * @summary Validates the model and returns the {@link ModelErrorDefinition} if any errors exist
   * @param {any[]} [args] - Optional arguments to control validation behavior
   * @return {ModelErrorDefinition | undefined} - Validation errors if any, otherwise undefined
   * @method
   */
  hasErrors(...args: any[]): ModelErrorDefinition | undefined;
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
  serialize(): string;
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
  hash(): string;
}

/**
 * @description Interface for objects that can be compared with other objects
 * @summary Defines the equality comparison API for model objects
 * @template T
 * @interface Comparable
 * @memberOf module:decorator-validation
 * @category Model
 */
export interface Comparable<T> {
  /**
   * @description Determines if this object is equal to another object
   * @summary Compares this object with another for equality
   * @param {T} other - The object to compare with
   * @param {any[]} [args] - Additional arguments for comparison
   * @return {boolean} - True if the objects are equal, false otherwise
   * @method
   */
  equals(other: T, ...args: any[]): boolean;
}
