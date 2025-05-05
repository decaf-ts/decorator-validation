import { Model } from "../model";

/**
 * @description Interface for the final stage of the decoration builder pattern
 * @summary Represents the build stage of the decoration builder, providing the ability to apply
 * the configured decorator to a target. This is the final stage in the builder chain.
 *
 * @interface DecorationBuilderBuild
 * @memberOf module:decorator-validation
 * @category Model
 */
export interface DecorationBuilderBuild {
  /**
   * @description Creates and returns the decorator function
   * @summary Finalizes the builder process and returns a decorator function that can be applied to a class,
   * property, or method.
   *
   * @returns {function} A decorator function that can be applied to a target
   */
  apply(): (
    target: object,
    propertyKey?: any,
    descriptor?: TypedPropertyDescriptor<any>
  ) => any;
}

/**
 * @description Interface for the extension stage of the decoration builder pattern
 * @summary Represents the extension stage of the decoration builder, providing the ability to add
 * additional decorators to the existing configuration.
 *
 * @interface DecorationBuilderEnd
 * @memberOf module:decorator-validation
 * @category Model
 */
export interface DecorationBuilderEnd {
  /**
   * @description Adds additional decorators to the existing configuration
   * @summary Extends the current decorator configuration with additional decorators.
   * This is useful for adding behavior to existing decorators.
   *
   * @param {...(ClassDecorator|PropertyDecorator|MethodDecorator)} decorators - Additional decorators to add
   * @returns {DecorationBuilderBuild} The build stage of the builder pattern
   */
  extend(
    ...decorators: (ClassDecorator | PropertyDecorator | MethodDecorator)[]
  ): DecorationBuilderBuild;
}

/**
 * @description Interface for the middle stage of the decoration builder pattern
 * @summary Represents the middle stage of the decoration builder, extending the end stage
 * and providing the ability to define the primary decorators for the configuration.
 *
 * @interface DecorationBuilderMid
 * @memberOf module:decorator-validation
 * @category Model
 */
export interface DecorationBuilderMid extends DecorationBuilderEnd {
  /**
   * @description Defines the primary decorators for the configuration
   * @summary Sets the main decorators for the current context. This is typically
   * called after specifying the key with the 'for' method.
   */
  define(
    ...decorators: (ClassDecorator | PropertyDecorator | MethodDecorator)[]
  ): DecorationBuilderEnd & DecorationBuilderBuild;
}

/**
 * @description Interface for the starting stage of the decoration builder pattern
 * @summary Represents the initial stage of the decoration builder, providing the entry point
 * for the builder pattern by specifying the key for the decorator.
 *
 * @interface DecorationBuilderStart
 * @memberOf module:decorator-validation
 * @category Model
 */
export interface DecorationBuilderStart {
  /**
   * @description Specifies the key for the decorator
   * @summary Sets the identifier for the decorator, which is used to register and retrieve
   * the decorator in the decoration registry.
   *
   * @param {string} id - The identifier for the decorator
   * @return {DecorationBuilderMid} The middle stage of the builder pattern
   */
  for(id: string): DecorationBuilderMid;
}

/**
 * @description Comprehensive interface for the complete decoration builder pattern
 * @summary A unified interface that combines all stages of the decoration builder pattern,
 * providing a complete API for creating, configuring, and applying decorators.
 * This interface is implemented by the Decoration class.
 *
 * @interface IDecorationBuilder
 * @memberOf module:decorator-validation
 * @category Model
 */
export interface IDecorationBuilder
  extends DecorationBuilderStart,
    DecorationBuilderMid,
    DecorationBuilderEnd,
    DecorationBuilderBuild {}

/**
 * @description Type definition for a function that resolves the flavour for a target
 * @summary Defines a function type that determines the appropriate flavour for a given target object.
 * This is used by the Decoration class to resolve which flavour of decorator to apply based on the target.
 *
 * @typedef {function(object): string} FlavourResolver
 *
 * @param {object} target - The target object to resolve the flavour for
 * @return {string} The resolved flavour identifier
 * @memberOf module:decorator-validation
 * @category Model
 */
export type FlavourResolver = (target: object) => string;

/**
 * @description Interface for serializing and deserializing model objects
 * @summary Defines the contract for classes that can convert model objects to and from string representations.
 * Serializers are used to persist models or transmit them over networks.
 *
 * @interface Serializer
 * @template T Type of model that can be serialized, must extend Model
 * @memberOf module:decorator-validation
 * @category Model
 */
export interface Serializer<M extends Model> {
  /**
   * @description Converts a model object to a string representation
   * @summary Serializes a model instance into a string format that can be stored or transmitted.
   * Additional arguments can be provided to customize the serialization process.
   *
   * @param {T} model - The model instance to serialize
   * @param {...any} args - Additional arguments for the serialization process
   * @return {string} The serialized representation of the model
   * @throws {Error} If the model cannot be serialized
   */
  serialize(model: M, ...args: any[]): string;

  /**
   * @description Reconstructs a model object from its string representation
   * @summary Deserializes a string back into a model instance.
   * Additional arguments can be provided to customize the deserialization process.
   *
   * @param {string} str - The serialized string to convert back to a model
   * @param {...any} args - Additional arguments for the deserialization process
   * @return {T} The reconstructed model instance
   * @throws {Error} If the string cannot be deserialized into a valid model
   */
  deserialize(str: string, ...args: any[]): M;
}
