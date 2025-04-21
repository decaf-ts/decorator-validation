import { Model } from "../model";

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
   * @param args
   * @method
   *
   * @throws {Error}
   */
  serialize(model: T, ...args: any[]): string;

  /**
   * @summary Rebuilds a model from serialization
   * @param {string} str
   *
   * @param args
   * @method
   *
   * @throws {Error}
   */
  deserialize(str: string, ...args: any[]): T;
}
