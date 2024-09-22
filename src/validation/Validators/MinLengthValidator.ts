import { Validator } from "./Validator";
import { ValidationKeys, DEFAULT_ERROR_MESSAGES } from "./constants";
import { Errors } from "../types";
import { validator } from "./decorators";

/**
 * @summary Minimum Length Validator
 * @description Validates strings and Arrays on their minimum length
 *
 * @param {string} [message] defaults to {@link DEFAULT_ERROR_MESSAGES#MIN_LENGTH}
 *
 * @class MinLengthValidator
 * @extends Validator
 *
 * @category Validators
 */
@validator(ValidationKeys.MIN_LENGTH)
export class MinLengthValidator extends Validator {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.MIN_LENGTH) {
    super(ValidationKeys.MIN_LENGTH, message, String.name, Array.name);
  }

  /**
   *
   * @param {string | Array} value
   * @param {number} minlength
   * @param {string} [message]
   *
   * @return Errors
   *
   * @memberOf MinLengthValidator
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: string | any[],
    minlength: number,
    message?: string,
  ): Errors {
    if (value === undefined) return;
    return value.length < minlength
      ? this.getMessage(message || this.message, minlength)
      : undefined;
  }
}
