import { Constructor } from "../../model";
import { Validator } from "./Validator";
import { Validation } from "../Validation";
import { ValidatorDefinition } from "./types";

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
export function validator(key: string) {
  return (original: Constructor<Validator>) => {
    Validation.register({
      validator: original,
      validationKey: key,
      save: true,
    } as ValidatorDefinition);
    return original;
  };
}
