import { Validator } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";
import { PatternValidatorOptions } from "../types";

/**
 * @description Regular expression for parsing string patterns with flags
 * @summary This regular expression is used to parse string patterns in the format "/pattern/flags".
 * It captures the pattern and flags separately, allowing the creation of a RegExp object
 * with the appropriate flags.
 *
 * @const {RegExp}
 * @memberOf module:decorator-validation
 */
export const regexpParser: RegExp = new RegExp("^/(.+)/([gimus]*)$");

/**
 * @description Validator for checking if a string matches a regular expression pattern
 * @summary The PatternValidator checks if a string value matches a specified regular expression pattern.
 * It supports both RegExp objects and string representations of patterns, including those with flags.
 * This validator is the foundation for specialized validators like EmailValidator and URLValidator,
 * and is typically used with the @pattern decorator.
 *
 * @param {string} [message] - Custom error message to display when validation fails, defaults to {@link DEFAULT_ERROR_MESSAGES#PATTERN}
 *
 * @class PatternValidator
 * @extends Validator
 *
 * @example
 * ```typescript
 * // Create a pattern validator with default error message
 * const patternValidator = new PatternValidator();
 *
 * // Create a pattern validator with custom error message
 * const customPatternValidator = new PatternValidator("Value must match the required format");
 *
 * // Validate using a RegExp object
 * const regexOptions = { pattern: /^[A-Z][a-z]+$/ };
 * patternValidator.hasErrors("Hello", regexOptions); // undefined (valid)
 * patternValidator.hasErrors("hello", regexOptions); // Returns error message (invalid)
 *
 * // Validate using a string pattern
 * const stringOptions = { pattern: "^\\d{3}-\\d{2}-\\d{4}$" };
 * patternValidator.hasErrors("123-45-6789", stringOptions); // undefined (valid)
 *
 * // Validate using a string pattern with flags
 * const flagOptions = { pattern: "/^hello$/i" };
 * patternValidator.hasErrors("Hello", flagOptions); // undefined (valid)
 * ```
 *
 * @mermaid
 * sequenceDiagram
 *   participant C as Client
 *   participant V as PatternValidator
 *
 *   C->>V: new PatternValidator(message)
 *   C->>V: hasErrors(value, options)
 *   alt value is empty
 *     V-->>C: undefined (valid)
 *   else pattern is missing
 *     V-->>C: Error: Missing Pattern
 *   else pattern is string
 *     V->>V: getPattern(pattern)
 *   end
 *   V->>V: Reset pattern.lastIndex
 *   V->>V: Test value against pattern
 *   alt pattern test passes
 *     V-->>C: undefined (valid)
 *   else pattern test fails
 *     V-->>C: Error message
 *   end
 *
 * @category Validators
 */
@validator(ValidationKeys.PATTERN)
export class PatternValidator extends Validator<PatternValidatorOptions> {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.PATTERN) {
    super(message, "string");
  }

  /**
   * @description Converts a string pattern to a RegExp object
   * @summary Parses a string representation of a regular expression and converts it to a RegExp object.
   * It handles both simple string patterns and patterns with flags in the format "/pattern/flags".
   *
   * @param {string} pattern - The string pattern to convert
   * @return {RegExp} A RegExp object created from the string pattern
   * @private
   */
  private getPattern(pattern: string): RegExp {
    if (!regexpParser.test(pattern)) return new RegExp(pattern);
    const match: any = pattern.match(regexpParser);
    return new RegExp(match[1], match[2]);
  }

  /**
   * @description Checks if a string matches a regular expression pattern
   * @summary Validates that the provided string matches the pattern specified in the options.
   * If the pattern is provided as a string, it's converted to a RegExp object using the getPattern method.
   * The method resets the pattern's lastIndex property to ensure consistent validation results
   * for patterns with the global flag.
   *
   * @param {string} value - The string to validate against the pattern
   * @param {PatternValidatorOptions} options - Configuration options containing the pattern
   *
   * @return {string | undefined} Error message if validation fails, undefined if validation passes
   *
   * @throws {Error} If no pattern is provided in the options
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: string,
    options: PatternValidatorOptions
  ): string | undefined {
    if (!value) return;

    let { pattern } = options;
    if (!pattern) throw new Error("Missing Pattern");
    pattern = typeof pattern === "string" ? this.getPattern(pattern) : pattern;
    pattern.lastIndex = 0; // resets pattern position for repeat validation requests
    return !pattern.test(value)
      ? this.getMessage(options.message || this.message)
      : undefined;
  }
}
