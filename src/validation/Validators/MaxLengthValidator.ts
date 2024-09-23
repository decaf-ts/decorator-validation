import { Errors } from "../types";
import { Validator } from "./Validator";
import { ValidationKeys, DEFAULT_ERROR_MESSAGES } from "./constants";
import { validator } from "./decorators";

/**
 * @summary Maximum Length Validator
 * @description Validates strings and Arrays on their maximum length
 *
 * @param {string} [message] defaults to {@link DEFAULT_ERROR_MESSAGES#MAX_LENGTH}
 *
 * @class MinLengthValidator
 * @extends Validator
 *
 * @category Validators
 */
@validator(ValidationKeys.MAX_LENGTH)
export class MaxLengthValidator extends Validator {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.MAX_LENGTH) {
    super(message, String.name, Array.name);
  }

  /**
   * @summary Validates a model
   *
   * @param {string} value
   * @param {number} maxlength
   * @param {string} [message]
   *
   * @return Errors
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: string | any[],
    maxlength: number,
    message?: string,
  ): Errors {
    if (value === undefined) return;
    return value.length > maxlength
      ? this.getMessage(message || this.message, maxlength)
      : undefined;
  }
}
