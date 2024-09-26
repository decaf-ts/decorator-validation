import { PatternValidator } from "./PatternValidator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";

/**
 * @summary Handles Password Validation
 *
 * @param {string} [errorMessage] defaults to {@link DEFAULT_ERROR_MESSAGES#PASSWORD}
 * @param {RegExp} [passwordPattern] defaults to {@link PasswordPatterns.CHAR8_ONE_OF_EACH}
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
   * @param {RegExp} [pattern]
   * @param {string} [message]
   *
   * @return {string | undefined}
   *
   * @override
   *
   * @see PatternValidator#hasErrors
   */
  public hasErrors(
    value: string,
    pattern?: RegExp,
    message?: string,
  ): string | undefined {
    return super.hasErrors(
      value,
      pattern || DEFAULT_ERROR_MESSAGES.PASSWORD,
      message || this.message,
    );
  }
}
