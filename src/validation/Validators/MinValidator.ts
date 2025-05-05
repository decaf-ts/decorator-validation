import { Validator } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";
import { MinValidatorOptions } from "../types";

/**
 * @description Validator for checking if a value is greater than or equal to a minimum
 * @summary The MinValidator checks if a numeric value, date, or string is greater than or equal to
 * a specified minimum value. It supports comparing numbers directly, dates chronologically,
 * and strings lexicographically. This validator is typically used with the @min decorator.
 * 
 * @param {string} [message] - Custom error message to display when validation fails, defaults to {@link DEFAULT_ERROR_MESSAGES#MIN}
 * 
 * @class MinValidator
 * @extends Validator
 * 
 * @example
 * ```typescript
 * // Create a min validator with default error message
 * const minValidator = new MinValidator();
 * 
 * // Create a min validator with custom error message
 * const customMinValidator = new MinValidator("Value must be at least {0}");
 * 
 * // Validate a number
 * const numOptions = { min: 10, message: "Number too small" };
 * const numResult = minValidator.hasErrors(50, numOptions); // undefined (valid)
 * const invalidNumResult = minValidator.hasErrors(5, numOptions); // Returns error message (invalid)
 * 
 * // Validate a date
 * const dateOptions = { min: new Date(2023, 0, 1) };
 * const dateResult = minValidator.hasErrors(new Date(2023, 5, 15), dateOptions); // undefined (valid)
 * ```
 * 
 * @mermaid
 * sequenceDiagram
 *   participant C as Client
 *   participant V as MinValidator
 *   
 *   C->>V: new MinValidator(message)
 *   C->>V: hasErrors(value, options)
 *   alt value is undefined
 *     V-->>C: undefined (valid)
 *   else value is Date and min is not Date
 *     V->>V: Convert min to Date
 *     alt conversion fails
 *       V-->>C: Error: Invalid Min param
 *     end
 *   end
 *   alt value < min
 *     V-->>C: Error message
 *   else value >= min
 *     V-->>C: undefined (valid)
 *   end
 * 
 * @category Validators
 */
@validator(ValidationKeys.MIN)
export class MinValidator extends Validator<MinValidatorOptions> {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.MIN) {
    super(message, "number", "Date", "string");
  }

  /**
   * @description Checks if a value is greater than or equal to a minimum
   * @summary Validates that the provided value is not less than the minimum value
   * specified in the options. For dates, it performs chronological comparison,
   * converting string representations to Date objects if necessary. For numbers
   * and strings, it performs direct comparison.
   *
   * @param {number | Date | string} value - The value to validate
   * @param {MinValidatorOptions} options - Configuration options containing the minimum value
   *
   * @return {string | undefined} Error message if validation fails, undefined if validation passes
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: number | Date | string,
    options: MinValidatorOptions
  ): string | undefined {
    if (typeof value === "undefined") return;

    let { min } = options;
    if (value instanceof Date && !(min instanceof Date)) {
      min = new Date(min);
      if (Number.isNaN(min.getDate()))
        throw new Error("Invalid Min param defined");
    }
    return value < min
      ? this.getMessage(options.message || this.message, min)
      : undefined;
  }
}
