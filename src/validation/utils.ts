import { ValidationKeys } from "./Validators/constants";

/**
 * @summary Builds the key to store as Metadata under Reflections
 * @description concatenates {@link ValidationKeys#REFLECT} with the provided key
 *
 * @param {string} key
 *
 * @function getModelKey
 * @memberOf module:decorator-validation.Utils
 * @category Utilities
 */
export function getValidationKey(key: string) {
  return ValidationKeys.REFLECT + key;
}
