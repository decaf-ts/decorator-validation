import { Validator } from "./Validator";
import { ValidationKeys, DEFAULT_ERROR_MESSAGES } from "./constants";
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
   * @param {string} [message]
   *
   * @return {string | undefined}
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(value: any, message?: string): string | undefined {
    switch (typeof value) {
      case "boolean":
      case "number":
        return typeof value === "undefined"
          ? this.getMessage(message || this.message)
          : undefined;
      default:
        return !value ? this.getMessage(message || this.message) : undefined;
    }
  }
}
