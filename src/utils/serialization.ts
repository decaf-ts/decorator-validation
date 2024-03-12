import { Model } from "../model/Model";
import { ModelKeys } from "./constants";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SerializationError } from "../errors/SerializationError";

/**
 * @summary Helper in serialization
 *
 * @interface Serializer
 * @category Serialization
 */
export interface Serializer<T extends Model> {
  /**
   * @summary Serializes a model
   * @param {T} model
   *
   * @method
   *
   * @throws {SerializationError}
   */
  serialize(model: T): string;

  /**
   * @summary Rebuilds a model from serialization
   * @param {string} str
   *
   * @method
   *
   * @throws {SerializationError}
   */
  deserialize(str: string): T;
}

/**
 * @summary Concrete implementation of a {@link Serializer} in JSON format
 * @description JS's native JSON.stringify (used here) is not deterministic
 * and therefore should not be used for hashing purposes
 *
 * To keep dependencies low, we will not implement this, but we recommend
 * implementing a similar {@link JSONSerializer} using 'deterministic-json' libraries
 *
 * @class JSONSerializer
 * @implements Serializer
 *
 * @category Serialization
 */
export class JSONSerializer<T extends Model> implements Serializer<T> {
  /**
   * @summary prepares the model for serialization
   * @description returns a shallow copy of the object, containing an enumerable {@link ModelKeys#ANCHOR} property
   * so the object can be recognized upon deserialization
   *
   * @param {T} model
   * @protected
   */
  protected preSerialize(model: T) {
    // TODO: nested preserialization (so increase performance when deserializing)
    const toSerialize = Object.assign({}, model);
    (toSerialize as Record<string, any>)[ModelKeys.ANCHOR] = (
      model as Record<string, any>
    )[ModelKeys.ANCHOR];
    return toSerialize;
  }

  /**
   * @summary Rebuilds a model from a serialization
   * @param {string} str
   *
   * @throws {Error} If it fails to parse the string, or to build the model
   */
  deserialize(str: string): T {
    const deserialization = JSON.parse(str);
    const model: T = Model.build(deserialization) as unknown as T;
    return model;
  }

  /**
   * @summary Serializes a model
   * @param {T} model
   *
   * @throws {Error} if fails to serialize
   */
  serialize(model: T): string {
    return JSON.stringify(this.preSerialize(model));
  }
}
