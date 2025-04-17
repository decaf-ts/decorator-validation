import { DEFAULT_ERROR_MESSAGES, DEFAULT_PATTERNS, ValidationKeys } from "./constants";
import { PatternValidator, PatternValidatorOptions } from "./PatternValidator";
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
   * @param {PatternValidatorOptions} [options]
   *
   * @return {string | undefined}
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: string,
    options: PatternValidatorOptions
  ): string | undefined {
    return super.hasErrors(value, {
      ...options,
      pattern: options.pattern || DEFAULT_PATTERNS.EMAIL,
    });
  }
}
