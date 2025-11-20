import { Validator } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";
import { MaxValidatorOptions } from "../types";

/**
 * @description Validator for checking if a value is less than or equal to a maximum
 * @summary The MaxValidator checks if a numeric value, date, or string is less than or equal to
 * a specified maximum value. It supports comparing numbers directly, dates chronologically,
 * and strings lexicographically. This validator is typically used with the @max decorator.
 *
 * @param {string} [message] - Custom error message to display when validation fails, defaults to {@link DEFAULT_ERROR_MESSAGES#MAX}
 *
 * @class MaxValidator
 * @extends Validator
 *
 * @example
 * ```typescript
 * // Create a max validator with default error message
 * const maxValidator = new MaxValidator();
 *
 * // Create a max validator with custom error message
 * const customMaxValidator = new MaxValidator("Value must not exceed {0}");
 *
 * // Validate a number
 * const numOptions = { max: 100, message: "Number too large" };
 * const numResult = maxValidator.hasErrors(50, numOptions); // undefined (valid)
 * const invalidNumResult = maxValidator.hasErrors(150, numOptions); // Returns error message (invalid)
 *
 * // Validate a date
 * const dateOptions = { max: new Date(2023, 11, 31) };
 * const dateResult = maxValidator.hasErrors(new Date(2023, 5, 15), dateOptions); // undefined (valid)
 * ```
 *
 * @mermaid
 * sequenceDiagram
 *   participant C as Client
 *   participant V as MaxValidator
 *
 *   C->>V: new MaxValidator(message)
 *   C->>V: hasErrors(value, options)
 *   alt value is undefined
 *     V-->>C: undefined (valid)
 *   else value is Date and max is not Date
 *     V->>V: Convert max to Date
 *     alt conversion fails
 *       V-->>C: Error: Invalid Max param
 *     end
 *   end
 *   alt value > max
 *     V-->>C: Error message
 *   else value <= max
 *     V-->>C: undefined (valid)
 *   end
 *
 * @category Validators
 */
@validator(ValidationKeys.MAX)
export class MaxValidator extends Validator<MaxValidatorOptions> {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.MAX) {
    super(message, Number.name, Date.name, String.name);
  }

  /**
   * @description Checks if a value is less than or equal to a maximum
   * @summary Validates that the provided value does not exceed the maximum value
   * specified in the options. For dates, it performs chronological comparison,
   * converting string representations to Date objects if necessary. For numbers
   * and strings, it performs direct comparison.
   *
   * @param {number | Date | string} value - The value to validate
   * @param {MaxValidatorOptions} options - Configuration options containing the maximum value
   *
   * @return {string | undefined} Error message if validation fails, undefined if validation passes
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: number | Date | string,
    options: MaxValidatorOptions
  ): string | undefined {
    if (typeof value === "undefined") return;

    let { max } = options;
    if (value instanceof Date && !(max instanceof Date)) {
      max = new Date(max);
      if (Number.isNaN(max.getDate()))
        throw new Error("Invalid Max param defined");
    }

    return value > max
      ? this.getMessage(options.message || this.message, max)
      : undefined;
  }
}
