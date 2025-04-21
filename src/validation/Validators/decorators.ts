import { Validator } from "./Validator";
import { Validation } from "../Validation";
import { Constructor } from "../../model/types";
import { ValidationKeys } from "./constants";
import { apply, metadata } from "@decaf-ts/reflection";
import { ValidatorDefinition } from "../types";

/**
 * @summary Marks the class as a validator for a certain key.
 * @description Registers the class in the {@link Validation} with the provided key
 *
 * @param {string} keys the validation key
 *
 * @function validator
 *
 * @category Decorators
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
    metadata(Validation.key(ValidationKeys.VALIDATOR), keys)
  );
}
