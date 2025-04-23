import { Validator } from "./Validator";
import { ValidationKeys, DEFAULT_ERROR_MESSAGES } from "./constants";
import { validator } from "./decorators";
import { MaxLengthValidatorOptions } from "../types";

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
export class MaxLengthValidator extends Validator<MaxLengthValidatorOptions> {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.MAX_LENGTH) {
    super(message, String.name, Array.name);
  }

  /**
   * @summary Validates a model
   *
   * @param {string} value
   * @param {MaxLengthValidatorOptions} options
   *
   * @return {string | undefined}
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: string | any[],
    options: MaxLengthValidatorOptions
  ): string | undefined {
    if (typeof value === "undefined") return;
    return value.length > options.maxlength
      ? this.getMessage(options.message || this.message, options.maxlength)
      : undefined;
  }
}
