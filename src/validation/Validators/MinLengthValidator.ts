import { Validator, ValidatorOptions } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";

export interface MinLengthValidatorOptions extends ValidatorOptions {
  minlength: number;
}

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
export class MinLengthValidator extends Validator<MinLengthValidatorOptions> {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.MIN_LENGTH) {
    super(message, String.name, Array.name);
  }

  /**
   *
   * @param {string | Array} value
   * @param {MinLengthValidatorOptions} options
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
    options: MinLengthValidatorOptions
  ): string | undefined {
    if (typeof value === "undefined") return;
    return value.length < options.minlength
      ? this.getMessage(options.message || this.message, options.minlength)
      : undefined;
  }
}
