import { Serializer } from "./types";
import { Constructor, Metadata } from "@decaf-ts/decoration";
import { Model } from "../model/Model";
import { ModelKeys } from "./constants";
import { Serialization } from "./serialization";

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
 * @category Model
 */
export class JSONSerializer<T extends Model<boolean>> implements Serializer<T> {
  constructor() {}
  /**
   * @summary prepares the model for serialization
   * @description returns a shallow copy of the object, containing an enumerable {@link ModelKeys#ANCHOR} property
   * so the object can be recognized upon deserialization
   *
   * @param {T} model
   * @protected
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected preSerialize(model: T, ...args: any[]) {
    // TODO: nested preserialization (so increase performance when deserializing)
    // TODO: Verify why there is no metadata
    const toSerialize: Record<string, any> = Object.assign({}, model);
    let metadata;
    try {
      metadata = Metadata.modelName(model.constructor as Constructor);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      metadata = undefined;
    }
    toSerialize[ModelKeys.ANCHOR] = metadata || model.constructor.name;
    return toSerialize;
  }

  /**
   * @summary Rebuilds a model from a serialization
   * @param {string} str
   *
   * @throws {Error} If it fails to parse the string, or to build the model
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  deserialize(str: string, ...args: any[]): T {
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  serialize(model: T, ...args: any[]): string {
    return JSON.stringify(this.preSerialize(model));
  }
}

Serialization["cache"] = {
  json: new JSONSerializer(),
};
