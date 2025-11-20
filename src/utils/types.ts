import { Model } from "../model";

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
