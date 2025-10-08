import { Constructor, Metadata } from "@decaf-ts/decoration";
import { Serializer } from "./types";
import { Model } from "../model/Model";
import { ModelKeys } from "./constants";

export const DefaultSerializationMethod = "json";

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
  protected preSerialize(model: T) {
    // TODO: nested preserialization (so increase performance when deserializing)
    // TODO: Verify why there is no metadata
    const toSerialize: Record<string, any> = Object.assign({}, model);
    let metadata;
    try {
      metadata = Metadata.modelName(model.constructor as Constructor);
    } catch (error) {
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

export class Serialization {
  private static current: string = DefaultSerializationMethod;

  private static cache: Record<string, Serializer<any>> = {
    json: new JSONSerializer(),
  };

  private constructor() {}

  private static get(key: string): any {
    if (key in this.cache) return this.cache[key];
    throw new Error(`No serialization method registered under ${key}`);
  }

  static register(
    key: string,
    func: Constructor<Serializer<any>>,
    setDefault = false
  ): void {
    if (key in this.cache)
      throw new Error(`Serialization method ${key} already registered`);
    this.cache[key] = new func();
    if (setDefault) this.current = key;
  }

  static serialize(obj: any, method?: string, ...args: any[]) {
    if (!method) return this.get(this.current).serialize(obj, ...args);
    return this.get(method).serialize(obj, ...args);
  }

  static deserialize(obj: string, method?: string, ...args: any[]) {
    if (!method) return this.get(this.current).deserialize(obj, ...args);
    return this.get(method).deserialize(obj, ...args);
  }

  static setDefault(method: string) {
    this.current = this.get(method);
  }
}
