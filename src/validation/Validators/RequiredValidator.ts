import { Validator } from "./Validator";
import { ValidationKeys, DEFAULT_ERROR_MESSAGES } from "./constants";
import { Errors } from "../types";

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
export class RequiredValidator extends Validator {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.REQUIRED) {
    super(ValidationKeys.REQUIRED, message);
  }

  /**
   * @summary Validates a model
   *
   * @param {string} value
   * @param {string} [message]
   *
   * @return Errors
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(value: any, message?: string): Errors {
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
