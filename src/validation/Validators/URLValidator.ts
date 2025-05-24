import {
  ValidationKeys,
  DEFAULT_ERROR_MESSAGES,
  DEFAULT_PATTERNS,
} from "./constants";
import { PatternValidator } from "./PatternValidator";
import { validator } from "./decorators";
import { PatternValidatorOptions } from "../types";

/**
 * @description Validator for checking if a string is a valid URL
 * @summary The URLValidator checks if a string matches a standard URL pattern.
 * It extends the PatternValidator and uses a robust URL regex pattern to validate web addresses.
 * The pattern is sourced from {@link https://gist.github.com/dperini/729294} and is widely
 * recognized for its accuracy in validating URLs. This validator is typically used with the @url decorator.
 *
 * @param {string} [message] - Custom error message to display when validation fails, defaults to {@link DEFAULT_ERROR_MESSAGES#URL}
 *
 * @class URLValidator
 * @extends PatternValidator
 *
 * @example
 * ```typescript
 * // Create a URL validator with default error message
 * const urlValidator = new URLValidator();
 *
 * // Create a URL validator with custom error message
 * const customUrlValidator = new URLValidator("Please enter a valid web address");
 *
 * // Validate a URL
 * const result = urlValidator.hasErrors("https://example.com"); // undefined (valid)
 * const invalidResult = urlValidator.hasErrors("not-a-url"); // Returns error message (invalid)
 * ```
 *
 * @mermaid
 * sequenceDiagram
 *   participant C as Client
 *   participant U as URLValidator
 *   participant P as PatternValidator
 *
 *   C->>U: new URLValidator(message)
 *   U->>P: super(message)
 *   C->>U: hasErrors(value, options)
 *   U->>P: super.hasErrors(value, options with URL pattern)
 *   P-->>U: validation result
 *   U-->>C: validation result
 *
 * @category Validators
 */
@validator(ValidationKeys.URL)
export class URLValidator extends PatternValidator {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.URL) {
    super(message);
  }

  /**
   * @description Checks if a string is a valid URL
   * @summary Validates that the provided string matches the URL pattern.
   * This method extends the PatternValidator's hasErrors method by ensuring
   * the URL pattern is used, even if not explicitly provided in the options.
   *
   * @param {string} value - The string to validate as a URL
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
      pattern: options.pattern || DEFAULT_PATTERNS.URL,
    });
  }
}
