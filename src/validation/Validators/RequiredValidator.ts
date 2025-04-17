import { Validator, ValidatorOptions } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";

/**
 * @summary Required Validator
 *
 * @param {string} [message] defaults to {@link DEFAULT_ERROR_MESSAGES#REQUIRED}
 *
 * @class RequiredValidator
 * @extends Validator
 *
 * @category Validators
 */
@validator(ValidationKeys.REQUIRED)
export class RequiredValidator extends Validator {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.REQUIRED) {
    super(message);
  }

  /**
   * @summary Validates a model
   *
   * @param {string} value
   * @param {ValidatorOptions} [options={}]
   *
   * @return {string | undefined}
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(value: any, options: ValidatorOptions = {}): string | undefined {
    switch (typeof value) {
      case "boolean":
      case "number":
        return typeof value === "undefined"
          ? this.getMessage(options.message || this.message)
          : undefined;
      default:
        return !value
          ? this.getMessage(options.message || this.message)
          : undefined;
    }
  }
}
