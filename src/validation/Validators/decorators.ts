import { Validator } from "./Validator";
import { Validation } from "../Validation";
import { Constructor, apply, metadata } from "@decaf-ts/decoration";
import { ValidationKeys } from "./constants";
import { ValidatorDefinition } from "../types";

/**
 * @summary Marks the class as a validator for a certain key.
 * @description Registers the class in the {@link Validation} with the provided key
 *
 * @param {string} keys the validation key
 *
 * @function validator
 *
 * @category Class Decorators
 */
export function validator<T extends Validator>(...keys: string[]) {
  return apply(
    ((original: Constructor<T>) => {
      keys.forEach((k: string) => {
        Validation.register({
          validator: original,
          validationKey: k,
          save: true,
        } as ValidatorDefinition);
      });
      return original;
    }) as ClassDecorator,
    metadata(ValidationKeys.VALIDATOR, keys)
  );
}
