import { PatternValidator, PatternValidatorOptions } from "./PatternValidator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";

/**
 * @summary Handles Password Validation
 *
 * @param {string} [errorMessage] defaults to {@link DEFAULT_ERROR_MESSAGES#PASSWORD}
 *
 * @class PasswordValidator
 * @extends PatternValidator
 *
 * @category Validators
 */
@validator(ValidationKeys.PASSWORD)
export class PasswordValidator extends PatternValidator {
  constructor(message = DEFAULT_ERROR_MESSAGES.PASSWORD) {
    super(message);
  }

  /**
   * @summary Validates a model
   *
   * @param {string} value
   * @param {PatternValidatorOptions} [options={}]
   *
   * @return {string | undefined}
   *
   * @override
   *
   * @see PatternValidator#hasErrors
   */
  public hasErrors(
    value: string,
    options: PatternValidatorOptions = {}
  ): string | undefined {
    return super.hasErrors(value, {
      ...options,
      message: options.message || this.message,
    });
  }
}
