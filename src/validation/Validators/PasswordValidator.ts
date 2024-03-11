import { PatternValidator } from "./PatternValidator";
import {
  DEFAULT_ERROR_MESSAGES,
  PasswordPatterns,
  ValidationKeys,
} from "./constants";
import { Errors } from "../types";

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
export class PasswordValidator extends PatternValidator {
  readonly pattern: RegExp;

  constructor(
    errorMessage = DEFAULT_ERROR_MESSAGES.PASSWORD,
    passwordPattern: RegExp = PasswordPatterns.CHAR8_ONE_OF_EACH,
  ) {
    super(ValidationKeys.PASSWORD, errorMessage);
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
