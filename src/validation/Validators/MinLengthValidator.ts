import { Validator } from "./Validator";
import { ValidationKeys, DEFAULT_ERROR_MESSAGES } from "./constants";
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
    super(message, String.name, Array.name);
  }

  /**
   *
   * @param {string | Array} value
   * @param {number} minlength
   * @param {string} [message]
   *
   * @return {string | undefined}
   *
   * @memberOf MinLengthValidator
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: string | any[],
    minlength: number,
    message?: string
  ): string | undefined {
    if (typeof value === "undefined") return;
    return value.length < minlength
      ? this.getMessage(message || this.message, minlength)
      : undefined;
  }
}
