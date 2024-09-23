import { PatternValidator } from "./PatternValidator";
import {
  DEFAULT_ERROR_MESSAGES,
  DEFAULT_PATTERNS,
  ValidationKeys,
} from "./constants";
import { Errors } from "../types";
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
  readonly pattern: RegExp;

  constructor(
    errorMessage = DEFAULT_ERROR_MESSAGES.PASSWORD,
    passwordPattern: RegExp = DEFAULT_PATTERNS.PASSWORD.CHAR8_ONE_OF_EACH,
  ) {
    super(errorMessage);
    this.pattern = passwordPattern;
  }

  /**
   * @summary Validates a model
   *
   * @param {string} value
   * @param {RegExp} [pattern]
   * @param {string} [message]
   *
   * @return Errors
   *
   * @override
   *
   * @see PatternValidator#hasErrors
   */
  public hasErrors(value: string, pattern: RegExp, message?: string): Errors {
    return super.hasErrors(
      value,
      pattern || this.pattern,
      message || this.message,
    );
  }
}
