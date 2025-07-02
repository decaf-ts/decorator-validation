import { validator } from "./decorators";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { UniqueValidatorOptions } from "../types";
import { AsyncValidator } from "./AsyncValidator";

@validator(ValidationKeys.UNIQUE)
export class UniqueValidator extends AsyncValidator<UniqueValidatorOptions> {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.UNIQUE) {
    super(message);
  }

  /**
   * @description Checks if a string is unique value
   * @summary Validates that the provided value is unique
   *
   * @param {string} value - The string to validate as unique
   * @param {UniqueValidatorOptions} [options={}] - Optional configuration options
   *
   * @return {string | undefined} Error message if validation fails, undefined if validation passes
   *
   * @override
   *
   * @see UniqueValidator#hasErrors
   */
  public override hasErrors(
    value: string,
    options: UniqueValidatorOptions
  ): Promise<string | undefined> {
    return new Promise((resolve) => {
      // const repo = Repository.forModel();
      // injectables.get();
      console.log(value, options);
      resolve("Not implemented");
    });
  }
}
