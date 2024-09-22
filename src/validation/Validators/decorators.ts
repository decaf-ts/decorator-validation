import { Validator } from "./Validator";
import { Validation } from "../Validation";
import { ValidatorDefinition } from "./types";
import { Constructor } from "../../model/types";

/**
 * @summary Marks the class as a validator for a certain key.
 * @description Registers the class in the {@link Validation} with the provided key
 *
 * @param {string} key the validation key
 *
 * @function validator
 *
 * @category Decorators
 */
export function validator<T extends Validator>(key: string) {
  return (original: Constructor<T>) => {
    Validation.register({
      validator: original,
      validationKey: key,
      save: true,
    } as ValidatorDefinition);
    return original;
  };
}
