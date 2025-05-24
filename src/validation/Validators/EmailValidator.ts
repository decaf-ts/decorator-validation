import {
  DEFAULT_ERROR_MESSAGES,
  DEFAULT_PATTERNS,
  ValidationKeys,
} from "./constants";
import { PatternValidator } from "./PatternValidator";
import { validator } from "./decorators";
import { PatternValidatorOptions } from "../types";

/**
 * @description Validator for checking if a string is a valid email address
 * @summary The EmailValidator checks if a string matches a standard email address pattern.
 * It extends the PatternValidator and uses a predefined email regex pattern to validate email addresses.
 * This validator is typically used with the @email decorator.
 *
 * @param {string} [message] - Custom error message to display when validation fails, defaults to {@link DEFAULT_ERROR_MESSAGES#EMAIL}
 *
 * @class EmailValidator
 * @extends PatternValidator
 *
 * @example
 * ```typescript
 * // Create an email validator with default error message
 * const emailValidator = new EmailValidator();
 *
 * // Create an email validator with custom error message
 * const customEmailValidator = new EmailValidator("Please enter a valid email address");
 *
 * // Validate an email
 * const result = emailValidator.hasErrors("user@example.com"); // undefined (valid)
 * const invalidResult = emailValidator.hasErrors("invalid-email"); // Returns error message (invalid)
 * ```
 *
 * @mermaid
 * sequenceDiagram
 *   participant C as Client
 *   participant E as EmailValidator
 *   participant P as PatternValidator
 *
 *   C->>E: new EmailValidator(message)
 *   E->>P: super(message)
 *   C->>E: hasErrors(value, options)
 *   E->>P: super.hasErrors(value, options with EMAIL pattern)
 *   P-->>E: validation result
 *   E-->>C: validation result
 *
 * @category Validators
 */
@validator(ValidationKeys.EMAIL)
export class EmailValidator extends PatternValidator {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.EMAIL) {
    super(message);
  }

  /**
   * @description Checks if a string is a valid email address
   * @summary Validates that the provided string matches the email pattern.
   * This method extends the PatternValidator's hasErrors method by ensuring
   * the email pattern is used, even if not explicitly provided in the options.
   *
   * @param {string} value - The string to validate as an email address
   * @param {PatternValidatorOptions} [options={}] - Optional configuration options
   *
   * @return {string | undefined} Error message if validation fails, undefined if validation passes
   *
   * @override
   *
   * @see PatternValidator#hasErrors
   */
  public override hasErrors(
    value: string,
    options: PatternValidatorOptions = {}
  ): string | undefined {
    return super.hasErrors(value, {
      ...options,
      pattern: options?.pattern || DEFAULT_PATTERNS.EMAIL,
    });
  }
}
