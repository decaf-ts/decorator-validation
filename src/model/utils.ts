import { ModelKeys } from "../utils/constants";
import { Model } from "./Model";

/**
 * @summary Builds the key to store as Metadata under Reflections
 * @description concatenates {@link ModelKeys#REFLECT} with the provided key
 * @param {string} str
 *
 * @function getModelKey
 * @memberOf module:decorator-validation.Model
 * @category Utilities
 */
export const getModelKey = (str: string) => ModelKeys.REFLECT + str;

/**
 * @summary For Serialization/deserialization purposes.
 * @description Reads the {@link ModelKeys.ANCHOR} property of a {@link Model} to discover the class to instantiate
 *
 * @function isModel
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 */
export function isModel(target: Record<string, any>) {
  try {
    return target instanceof Model || !Model.getMetadata(target as any);
  } catch (e: any) {
    return false;
  }
}
