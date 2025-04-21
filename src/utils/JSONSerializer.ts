import { Model } from "../model/Model";
import { Serializer } from "./types";
import { ModelKeys } from "./constants";

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
    const toSerialize: Record<string, any> = Object.assign({}, model);
    const metadata = Model.getMetadata(model);
    toSerialize[ModelKeys.ANCHOR] = metadata || model.constructor.name;
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
    const className = deserialization[ModelKeys.ANCHOR];
    if (!className)
      throw new Error("Could not find class reference in serialized model");
    const model: T = Model.build(deserialization, className) as unknown as T;
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
