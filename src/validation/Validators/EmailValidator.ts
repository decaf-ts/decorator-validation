import {
  ValidationKeys,
  DEFAULT_ERROR_MESSAGES,
  DEFAULT_PATTERNS,
} from "./constants";
import { PatternValidator } from "./PatternValidator";
import { validator } from "./decorators";

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
@validator(ValidationKeys.EMAIL)
export class EmailValidator extends PatternValidator {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.EMAIL) {
    super(message);
  }

  /**
   * @summary Validates a model
   *
   * @param {string} value
   * @param {string} [message]
   *
   * @return {string | undefined}
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(value: string, message?: string): string | undefined {
    return super.hasErrors(value, DEFAULT_PATTERNS.EMAIL, message);
  }
}
