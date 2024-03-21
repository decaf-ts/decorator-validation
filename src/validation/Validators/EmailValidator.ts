import { ValidationKeys, DEFAULT_ERROR_MESSAGES } from "./constants";
import { Errors } from "../types";
import { PatternValidator } from "./PatternValidator";

/**
 * @summary Email Validator
 *
 * @param {string} [message] defaults to {@link DEFAULT_ERROR_MESSAGES#EMAIL}
 *
 * @class EmailValidator
 * @extends PatternValidator
 *
 * @category Validators
 */
export class EmailValidator extends PatternValidator {
  private static readonly emailPat: RegExp =
    /[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/;

  constructor(message: string = DEFAULT_ERROR_MESSAGES.EMAIL) {
    super(ValidationKeys.EMAIL, message);
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
  public hasErrors(value: string, message?: string): Errors {
    return super.hasErrors(value, EmailValidator.emailPat, message);
  }
}
